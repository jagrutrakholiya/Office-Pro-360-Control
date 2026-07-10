// Shared UI primitive library for the control-panel (super-admin) app.
// Import from '@/components/ui' or '../../components/ui'.

export { default as Button, IconButton } from './Button'
export type { ButtonProps, IconButtonProps } from './Button'

export {
  default as Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from './Card'
export type { CardProps } from './Card'

export { default as PageHeader } from './PageHeader'
export type { PageHeaderProps, Breadcrumb } from './PageHeader'

export { default as StatCard } from './StatCard'
export type { StatCardProps, StatCardDelta } from './StatCard'

export { default as Badge } from './Badge'
export type { BadgeProps } from './Badge'

export { default as DataTable } from './DataTable'
export type { DataTableProps, Column } from './DataTable'

export { default as EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

export { default as Tabs } from './Tabs'
export type { TabsProps, TabItem } from './Tabs'

export { Input, Textarea, Select } from './Input'
export type {
  InputProps,
  TextareaProps,
  SelectProps,
  SelectOption,
} from './Input'

export { default as Modal } from './Modal'
export type { ModalProps } from './Modal'

// Re-export the existing Skeleton primitive (named export in ../Skeleton).
export { Skeleton } from '../Skeleton'
