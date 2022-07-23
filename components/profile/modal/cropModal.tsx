import { useState, useRef } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalHeader,
  Text,
  HStack,
  ModalCloseButton,
  Img,
} from '@chakra-ui/react';
import ReactCrop, {
  Crop,
  centerCrop,
  makeAspectCrop,
  PixelCrop,
} from 'react-image-crop';
import styles from './cropModal.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCrop: (_blob?: Blob) => void;
  selectedImage?: string;
  selectedImageType?: string;
};

/** トリミング時の設定情報 */
const TRIMMING_CONF = {
  /** トリミング時の画像を選択できるアスペクト比は「1対1」 */
  ASPECT: 1 / 1,
  /** トリミング時のスケールは等倍 */
  SCALE: 1,
  /** トリミング時の角度は0 */
  ROTATE: 0,
};

/**
 *
 * @see https://github.com/DominicTobias/react-image-crop#react-image-crop
 * @see https://codesandbox.io/s/react-image-crop-demo-with-react-hooks-y831o
 *
 */
export const CropModal: React.FC<Props> = ({
  isOpen,
  onCrop,
  onClose,
  selectedImage,
  selectedImageType,
}) => {
  const [crop, setCrop] = useState<Crop | undefined>();
  // 範囲選択した画像
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>();
  // 範囲選択しない状態の画像(edit.tsxで選択された画像)のref、getTrimmedCanvas で計算するために必要
  const imgRef = useRef<HTMLImageElement>(null);
  // 範囲選択をした画像のref、getTrimmedCanvas で計算するために必要
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  //***********************************
  /** 範囲選択後に「確定」ボタンを押した時 */
  //***********************************
  const handleOk = () => {
    const canvas = getTrimmedCanvas();
    if (!canvas) {
      return;
    }

    // 選択時の MIME タイプが何もなかった場合、'image/jpeg' を指定
    const imageType = selectedImageType ? selectedImageType : 'image/jpeg';

    // キャンパスに描画した画像（トリミング後の画像）を、Blobに変換する
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        // edit.tsx の handleCrop を実行
        onCrop(blob);
        setCompletedCrop(undefined);
        onClose();
      },
      imageType,
      1,
    );
  };

  const getTrimmedCanvas = () => {
    if (!completedCrop || !crop) {
      return;
    }

    const TO_RADIANS = Math.PI / 180;
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas!.getContext('2d');

    if (!image || !canvas || !ctx) {
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const rotateRads = TRIMMING_CONF.ROTATE * TO_RADIANS;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotateRads);
    ctx.scale(TRIMMING_CONF.SCALE, TRIMMING_CONF.SCALE);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );

    ctx.restore();

    return canvas;
  };

  //*******************************************
  /** トリミングをキャンセルした(モーダルを閉じた)時 */
  //*******************************************
  const handleCancel = () => {
    onCrop(undefined);
    setCompletedCrop(undefined);
    onClose();
  };

  const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: 'px',
          width: 0,
          height: 0,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, TRIMMING_CONF.ASPECT));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent maxW={'750px'}>
        <ModalHeader className={styles.modal__header}>
          <Text className={styles.modal__header_text}>
            範囲を選択して下さい
          </Text>
        </ModalHeader>
        <ModalCloseButton onClick={handleCancel} />
        <ModalBody className={styles.modal__body}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={TRIMMING_CONF.ASPECT}
          >
            {/* ユーザーから見えているプレビュー画像 */}
            <Img
              className={styles.modal__image}
              // getTrimmedCanvas で計算するために必要
              ref={imgRef}
              // edit.tsx で選択された画像を表示
              src={selectedImage}
              alt="image"
              onLoad={onImageLoad}
            />
          </ReactCrop>
          {/* ユーザーからは見えないが、内部的に範囲選択された画像を保持、getTrimmedCanvas で計算するために必要 */}
          <div className={styles.modal__preview}>
            {completedCrop && <canvas ref={previewCanvasRef} />}
          </div>
        </ModalBody>

        <ModalFooter justifyContent={'space-around'}>
          <HStack>
            <Button
              width={'120px'}
              onClick={handleOk}
              // 範囲選択していないと、確定ボタンが押せない
              disabled={!completedCrop}
            >
              確定
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
