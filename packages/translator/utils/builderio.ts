import { builder } from '@builder.io/react';

import builderConfig from '@/config/builder';

builder.init(builderConfig.apiKey);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPages = async (pages: string[] | undefined): Promise<any> => {
  const urlPath = '/' + (pages?.join('/') || '');
  return (
    builder
      .get('page', {
        userAttributes: {
          urlPath,
        },
      })
      .toPromise() || null
  );
};

const getAllPages = () => {
  return builder.getAll('page', {
    options: { noTargeting: true },
    omit: 'data.blocks',
  });
};

export { getPages, getAllPages };
