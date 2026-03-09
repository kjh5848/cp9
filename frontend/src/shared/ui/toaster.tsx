'use client';

import { Toaster as HotToaster, ToasterProps } from 'react-hot-toast';

export const Toaster = (props: ToasterProps) => {
  return <HotToaster {...props} />;
};
