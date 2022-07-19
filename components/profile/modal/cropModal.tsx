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
  /** トリミング時のアスペクト比は「1対1」 */
  ASPECT: 1 / 1,
  /** トリミング時のスケールは等倍 */
  SCALE: 1,
  /** トリミング時の角度は0 */
  ROTATE: 0,
};

export const CropModal: React.FC<Props> = ({
  isOpen,
  onCrop,
  onClose,
  selectedImage,
  selectedImageType,
}) => {
  const [crop, setCrop] = useState<Crop | undefined>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleOk = () => {
    const canvas = getTrimmedCanvas();
    if (!canvas) {
      return;
    }

    const imageType = selectedImageType ? selectedImageType : 'image/jpeg';

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        onCrop(blob);
        setCompletedCrop(undefined);
        onClose();
      },
      imageType,
      1
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
      image.naturalHeight
    );

    ctx.restore();

    return canvas;
  };

  const handleCancel = () => {
    onCrop(undefined);
    setCompletedCrop(undefined);
    onClose();
  };

  const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
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
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
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
            <Img
              className={styles.modal__image}
              ref={imgRef}
              src={selectedImage}
              alt="image"
              onLoad={onImageLoad}
            />
          </ReactCrop>
          <div className={styles.modal__preview}>
            {completedCrop && <canvas ref={previewCanvasRef} />}
          </div>
        </ModalBody>

        <ModalFooter justifyContent={'space-around'}>
          <HStack>
            <Button
              width={'120px'}
              onClick={handleOk}
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
