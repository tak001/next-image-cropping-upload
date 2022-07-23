import { Link, LinkProps } from "@chakra-ui/react";
import { forwardRef } from "react";

const WrapperLink = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { children, ...linkProps } = props;
  return (
    <Link _focus={{ boxShadow: "none" }} {...linkProps} ref={ref}>
      <>{children}</>
    </Link>
  );
});

WrapperLink.displayName = "WrapperLink";
export default WrapperLink;
