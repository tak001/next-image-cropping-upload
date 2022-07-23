import { Container, Heading } from '@chakra-ui/react';
import { ProfileEdit } from './edit/edit';

export const ProfileContainer = () => {
  return (
    <Container>
      <Heading>プロフィール編集</Heading>
      <ProfileEdit />
    </Container>
  );
};
