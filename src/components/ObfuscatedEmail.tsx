import { type ComponentProps, type JSX } from "react";

import { A } from "./A";

interface Props extends ComponentProps<typeof A> {
  base64Email: string;
}

/**
 * Render a `mailto:` link without exposing the email address statically in the source code,
 * which would be easy to scrape.
 */
export function ObfuscatedEmail(props: Props): JSX.Element {
  const { base64Email, ...rest } = props;
  const bareEmail = atob(base64Email);
  return (
    <A href={"mailto:" + bareEmail} {...rest}>
      {bareEmail}
    </A>
  );
}
