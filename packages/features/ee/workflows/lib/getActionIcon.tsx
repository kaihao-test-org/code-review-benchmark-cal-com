import { isSMSOrWhatsappAction } from "@calcom/features/ee/workflows/lib/actionHelperFunctions";
import { Icon } from "@calcom/ui/components/icon";
import classNames from "@calcom/ui/classNames";

import type { WorkflowStep } from "../lib/types";

export function getActionIcon(steps: WorkflowStep[], className?: string): JSX.Element {
  const iconClassName = classNames(className ? className : "mr-1.5 inline h-3 w-3");
  const hasTextMessageStep = steps.some((step) => isSMSOrWhatsappAction(step.action));
  const hasEmailStep = steps.some((step) => !isSMSOrWhatsappAction(step.action));

  const iconName = !steps.length
    ? "zap"
    : !hasEmailStep
    ? "smartphone"
    : !hasTextMessageStep
    ? "mail"
    : "bell";

  return <Icon name={iconName} className={iconClassName} aria-hidden="true" />;
}
