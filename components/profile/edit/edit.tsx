import {
  Container,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useDisclosure,
  VStack,
  Img,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Resizer from 'react-image-file-resizer';
import { useProfileImageNew, useProfileImageDelete } from 'usecase/profile';
import { CropModal } from '../modal/cropModal';
import { ProfileEditFormInput } from './types/form';
import 'react-image-crop/dist/ReactCrop.css';
import styles from './edit.module.scss';

/** アップロード画像の上限は5MB */
const MAX_FILE_SIZE = 5000000;

export const ProfileEdit = () => {
  const [isLoading, setIsLoading] = useState(false);
  // CropModal へ渡すための、ユーザーが選択したリサイズで小さくした画像
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  // CropModal へ渡すための、ユーザーが選択した画像の種類
  // トリミング後の画像形式を保持するために必要
  const [selectedImageType, setSelectedImageType] = useState<string>();
  // ブラウザ表示用の path
  const [previewImagePath, setPreviewImagePath] = useState<string>();
  // トリミング後の Blob データ（アップロード用）
  const [trimmedBlob, setTrimmedBlob] = useState<Blob>();
  // トリミング後の画像サイズが5MBであるかどうか
  const [isErrorImage, setIsErrorImage] = useState<boolean>(false);
  // 本来は、fetchData に DB に保存されて表示用の imagePath があるので、それをファーストビューで表示させる
  // const { profile } = useProfileDetail();
  const { profileImageNewHandler } = useProfileImageNew();
  const { profileImageDeleteHandler } = useProfileImageDelete();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    handleSubmit,
    formState: { errors },
    // reset,
    setError,
    clearErrors,
  } = useForm<ProfileEditFormInput>();

  //****************************************
  /** 初期表示用に fetchData を form へセット */
  //****************************************
  useEffect(() => {
    // ブラウザ表示用に、fetchした画像pathをセットする
    // setPreviewImagePath(profile?.imagePath);
    // 本来は fetchData の値をセット
    setPreviewImagePath(
      'https://1.bp.blogspot.com/-tVeC6En4e_E/X96mhDTzJNI/AAAAAAABdBo/jlD_jvZvMuk3qUcNjA_XORrA4w3lhPkdQCNcBGAsYHQ/s400/onepiece01_luffy.png',
    );

    // その他のプロフィール情報をスプレッド構文で、「form の初期値」としてセット
    // reset({
    //   ...profile,
    // });
    // }, [profile, reset]);
  }, []);

  //*********************************************************************************
  /** 画像を選択して isErrorImage の値が変わった時*/
  //*********************************************************************************
  useEffect(() => {
    // トリミング後の画像が、5MB以上であれば「errors?.imagePath」の部分でエラーが出るようにする
    if (isErrorImage) {
      // react-hook-form の error にセットする
      setError('imagePath', { type: 'custom' });
      return;
    }
    clearErrors('imagePath');
  }, [isErrorImage, setError, clearErrors]);

  //****************************
  /** 保存ボタンをクリックしたとき */
  //****************************
  const onSubmit = async (data: ProfileEditFormInput) => {
    // 他APIがあれば
    const promiseArray = [];

    // const changedImage = previewImagePath !== profile?.imagePath;
    const changedImage =
      previewImagePath !==
      'https://1.bp.blogspot.com/-tVeC6En4e_E/X96mhDTzJNI/AAAAAAABdBo/jlD_jvZvMuk3qUcNjA_XORrA4w3lhPkdQCNcBGAsYHQ/s400/onepiece01_luffy.png';

    setIsLoading(true);

    // DB へアップロードできるように、FormData へ Blob を append する
    const formData = new FormData();
    formData.append('image', trimmedBlob!);

    // 選択中の画像があればPOST、なければDELETE
    const imageHandler = !!previewImagePath
      ? profileImageNewHandler
      : profileImageDeleteHandler;

    // fetchData の画像が変更されていれば、画像のAPIを走らせる
    // 初期表示と画像が変わっていなかれば、API を走らせる必要がない
    if (changedImage) {
      promiseArray.push(imageHandler(formData));
    }

    await Promise.all(promiseArray);
    // 処理
  };

  //****************************
  /** 削除ボタンをクリックしたとき */
  //****************************
  const handleClickDeleteImage = () => {
    // ブラウザ表示用の URL を空にする
    setPreviewImagePath('');
    // 5MB以上選択した時のエラーもリセットする
    setIsErrorImage(false);
  };

  const resizeFile = (file: Blob, type: string): Promise<string> => {
    // モーダルのサイズに合わせてリサイズ
    const maxWidth = 750;
    const maxHeight = 750;
    const quality = 50;
    const rotation = 0;

    return new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        maxWidth,
        maxHeight,
        type,
        quality,
        rotation,
        (uri) => {
          resolve(uri.toString());
        },
        'base64',
      );
    });
  };

  //**************************
  /** ユーザーが画像を選択した時 */
  //**************************
  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // e.target.files[0]の型は「File: blob」blobを継承したFile型
      const file = e.target.files[0];
      // ファイルのタイプを示すメディアタイプ (MIME) を含む文字列。たとえば、 PNG 画像の場合は "image/png"
      setSelectedImageType(file.type);
      // 選択時に、画像を圧縮してから CropModal へ渡す
      const resizedImage = await resizeFile(file, file.type);
      // CropModal へ渡すための、ユーザーが選択したリサイズで小さくした画像をセット
      setSelectedImage(resizedImage);
      // CropModal を開く
      onOpen();
    }
  };

  //**************************************************************************
  /** モーダルで画像をトリミングして、OKボタンを押すと、トリミング後の blob 値を受け取る */
  //**************************************************************************
  const handleCrop = (blob?: Blob) => {
    if (!blob) {
      return;
    }
    // ブラウザ表示用の state に、表示ができるような一時的な URL を createObjectURL で作成して、セットする
    setPreviewImagePath(URL.createObjectURL(blob));
    // トリミング後の画像サイズが、5MB以上であればエラー
    setIsErrorImage(blob.size > MAX_FILE_SIZE);
    // トリミング後の Blob データ（アップロード用）をセット
    setTrimmedBlob(blob);
    // モーダルでトリミングした後なので、CropModal へ渡すための画像がリセット
    setSelectedImage(undefined);
    // 同じくユーザーがが選択した、画像の種類をリセット
    setSelectedImageType('');
  };

  return (
    <Container className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormControl>
          <Box className={styles.container__input_box}>
            <FormLabel fontSize={'1.1rem'} className={styles.container__label}>
              画像
            </FormLabel>
            <VStack alignItems={'flex-start'}>
              {previewImagePath ? (
                <>
                  <VStack>
                    <Img
                      src={previewImagePath}
                      alt="image"
                      className={styles.container__file_preview}
                    />
                    <Button
                      onClick={handleClickDeleteImage}
                      fontSize={'0.8rem'}
                      width={'50px'}
                      height={'22px'}
                      border={'0px'}
                    >
                      X 削除
                    </Button>
                  </VStack>
                  {errors?.imagePath && (
                    <Text className={styles.container__error}>
                      5MB以下にして下さい。
                    </Text>
                  )}
                </>
              ) : (
                // プレビュー用の path がない時、つまりトリミング後画像か表示画像がない時、なのでnoImageを表示
                <>
                  <label className={styles.container__file_button}>
                    <Input
                      className={styles.container__input_file}
                      type="file"
                      accept={'image/jpeg, image/png, image/gif'}
                      onChange={(e) => handleChangeFile(e)}
                      /**
                       * 以下の onClick は同じ画像を選択しても、onChangeが走るようにするためのコード
                       * @see https://qiita.com/tak001/items/c88eddfc7e97bd748cb4
                       */
                      onClick={(e) => {
                        (e.target as HTMLInputElement).value = '';
                      }}
                    />
                  </label>
                  <Text fontSize={'0.8rem'}>推奨サイズ: 横XXXpx　縦XXXpx</Text>
                </>
              )}
              <CropModal
                isOpen={isOpen}
                onClose={onClose}
                onCrop={handleCrop}
                selectedImage={selectedImage}
                selectedImageType={selectedImageType}
              />
            </VStack>
          </Box>
        </FormControl>
        <Box className={styles.container__button}>
          <Button type={'submit'} isLoading={isLoading}>
            保存する
          </Button>
        </Box>
      </form>
    </Container>
  );
};
