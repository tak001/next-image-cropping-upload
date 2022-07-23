import { Container } from "@chakra-ui/react";
import { ProfileEdit } from "./edit/edit";

export const ProfileContainer = () => {
  return (
    <Container maxW={1080}>
      <h1>プロフィール編集</h1>
      <ProfileEdit />
    </Container>
  );
};
