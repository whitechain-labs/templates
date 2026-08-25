import type { ReactNode } from 'react';

import { ApiBadge, type ApiSurface } from './api-badge';
import { Card, CardBody, CardHeader } from './card';

export interface SectionProps {
  title: string;
  description?: string;
  surface: ApiSurface;
  call: string;
  /** Rendered to the right of the title, e.g. a row count. */
  aside?: ReactNode;
  children: ReactNode;
}

/** A titled card with a provenance badge. The building block for every panel. */
export function Section({ title, description, surface, call, aside, children }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          {aside}
        </div>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        <ApiBadge surface={surface} call={call} className="pt-1" />
      </CardHeader>
      <CardBody className="pt-4">{children}</CardBody>
    </Card>
  );
}
