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
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import {
  useProfileDetail,
  useProfileEdit,
  useProfileImageNew,
  useProfileImageDelete,
} from "usecase/profile";
import { ERROR_MESSAGE, MESSAGE } from "components/shared/messages";
import { toastOptions } from "components/shared/toastOptions";
import { CropModal } from "../modal/cropModal";
import { ProfileEditFormInput } from "./types/form";
import "react-image-crop/dist/ReactCrop.css";
import styles from "./edit.module.scss";

/** アップロード画像の上限は5MB */
const MAX_FILE_SIZE = 5000000;

export const ProfileEdit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [selectedImageType, setSelectedImageType] = useState<string>();
  const [previewImagePath, setPreviewImagePath] = useState<string>();
  const [trimmedBlob, setTrimmedBlob] = useState<Blob>();
  const [isErrorImage, setIsErrorImage] = useState<boolean>(false);
  const { profile } = useProfileDetail();
  const { profileEditHandler } = useProfileEdit();
  const { profileImageNewHandler } = useProfileImageNew();
  const { profileImageDeleteHandler } = useProfileImageDelete();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm<ProfileEditFormInput>();

  useEffect(() => {
    setPreviewImagePath(profile?.imagePath);
    reset({
      ...profile,
    });
  }, [profile, reset]);

  useEffect(() => {
    if (isErrorImage) {
      setError("imagePath", { type: "custom" });
      return;
    }
    clearErrors("imagePath");
  }, [isErrorImage, setError, clearErrors]);

  const onSubmit = async (data: ProfileEditFormInput) => {
    const promiseArray = [profileEditHandler(data)];

    const changedImage = previewImagePath !== profile?.imagePath;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", trimmedBlob!);

    const imageHandler = !!previewImagePath
      ? profileImageNewHandler
      : profileImageDeleteHandler;

    if (changedImage) {
      promiseArray.push(imageHandler(formData));
    }

    await Promise.all(promiseArray)
      .then(() => {
        toast({ ...toastOptions, description: MESSAGE.SAVE });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleClickDeleteImage = () => {
    setPreviewImagePath("");
    setIsErrorImage(false);
  };

  // const existsCode = (code: string) => {
  //   return !!profile?.strongAreas?.some(
  //     (item: StrongArea) => item.code === code
  //   );
  // };

  const resizeFile = (file: Blob, type: string): Promise<string> => {
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
        "base64"
      );
    });
  };

  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImageType(file.type);
      const resizedImage = await resizeFile(file, file.type);
      setSelectedImage(resizedImage);
      onOpen();
    }
  };

  const handleCrop = (blob?: Blob) => {
    if (!blob) {
      return;
    }
    setPreviewImagePath(URL.createObjectURL(blob));
    setIsErrorImage(blob.size > MAX_FILE_SIZE);
    setTrimmedBlob(blob);
    setSelectedImage(undefined);
    setSelectedImageType("");
  };

  return (
    <Container className={styles.container} maxW={"750px"}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormControl>
          <Box className={styles.container__input_box}>
            <FormLabel fontSize={"1.1rem"} className={styles.container__label}>
              写真
            </FormLabel>
            <VStack alignItems={"flex-start"}>
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
                      fontSize={"0.8rem"}
                      width={"50px"}
                      height={"22px"}
                      border={"0px"}
                    >
                      X 削除
                    </Button>
                  </VStack>
                  {errors?.imagePath && (
                    <Text className={styles.container__error}>
                      {ERROR_MESSAGE.OVER_IMAGE_SIZE}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <label className={styles.container__file_button}>
                    <Input
                      className={styles.container__input_file}
                      type="file"
                      accept={"image/jpeg, image/png, image/gif"}
                      onChange={(e) => handleChangeFile(e)}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).value = "";
                      }}
                    />
                  </label>
                  <Text fontSize={"0.8rem"}>推奨サイズ: 横480px　縦480px</Text>
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
        <Box textAlign={"center"} className={styles.container__button}>
          <Button type={"submit"} isLoading={isLoading}>
            保存する
          </Button>
        </Box>
      </form>
    </Container>
  );
};
