import { UseToastOptions } from "@chakra-ui/react";
import { MESSAGE } from "./messages";

export const toastOptions: UseToastOptions = {
  description: MESSAGE.SEND,
  position: "top",
  status: "success",
  isClosable: true,
  variant: "subtle",
};
