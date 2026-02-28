import type { PropsWithChildren } from 'react';
import AppTopBar from './AppTopBar';

interface ScreenTemplateProps extends PropsWithChildren {
  title: string;
  backHref?: string;
}

export default function ScreenTemplate({ title, backHref, children }: ScreenTemplateProps) {
  return (
    <div className="app-content page-transition">
      <AppTopBar title={title} backHref={backHref} />
      <div className="space-y-4">{children}</div>
    </div>
  );
}
