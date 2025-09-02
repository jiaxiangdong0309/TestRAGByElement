declare module '@/*' {
  const content: any;
  export default content;
}

declare module '@/*' {
  import type * as Types from 'vite/client';
  const content: Types.ImportMetaEnv;
  export default content;
}