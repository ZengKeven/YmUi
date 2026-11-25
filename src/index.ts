import { version as packageVersion } from '../package.json'

export { YmBadge, type BadgeProps } from './components/badge'
export { YmButton, type ButtonProps } from './components/button'
export { YmCalendar, type CalendarCell, type CalendarProps } from './components/calendar'
export * from './components/form'
export { YmDatePicker, type DatePickerMode, type DatePickerProps, type DatePickerValue, type DateRangeValue } from './components/date-picker'
export { YmDescriptions, YmDescriptionsItem, type DescriptionsProps, type DescriptionsItemProps } from './components/descriptions'
export {
  YmCheckbox, YmCheckboxGroup, type CheckboxGroupChangeContext, type CheckboxGroupProps,
  type CheckboxOption, type CheckboxProps, type CheckboxValue,
} from './components/checkbox'
export { YmIcon, type IconName, type IconProps } from './components/icon'
export { YmImage, type ImageProps } from './components/image'
export { YmImageUpload, type ImageUploadFile, type ImageUploadProps, type ImageUploadRequestContext, type ImageUploadResponse, type ImageUploadResult } from './components/image-upload'
export {
  YmColorPicker, YmColorPickerPanel, type ColorFormat, type ColorMode, type ColorObject,
  type ColorPickerChangeContext, type ColorPickerChangeTrigger, type ColorPickerPanelProps, type ColorPickerProps,
} from './components/color-picker'
export { YmInput, type InputProps } from './components/input'
export { YmInputNumber, type InputNumberProps } from './components/input-number'
export { YmLayout, type LayoutProps } from './components/layout'
export { YmLoading, type LoadingProps } from './components/loading'
export { YmMenu, type MenuItem, type MenuLeaf, type MenuProps, type MenuValue } from './components/menu'
export { YmPagination, type PageInfo, type PaginationProps } from './components/pagination'
export { YmPopup, type PopupPlacement, type PopupProps, type PopupTrigger } from './components/popup'
export { YmRadio, YmRadioGroup, type RadioGroupProps, type RadioOption, type RadioProps, type RadioValue } from './components/radio'
export { YmRate, type RateProps } from './components/rate'
export { YmSelect, type SelectKey, type SelectOption, type SelectProps, type SelectValue } from './components/select'
export { YmSpace, type SpaceProps, type SpaceSize } from './components/space'
export { YmSteps, type StepOption, type StepsProps, type StepStatus, type StepValue } from './components/steps'
export { YmSwitch, type SwitchProps, type SwitchValue } from './components/switch'
export { YmTabs, YmTabPanel, type TabPanelProps, type TabsProps, type TabValue } from './components/tabs'
export { YmTag, type TagProps } from './components/tag'
export { YmTextarea, type TextareaAutosize, type TextareaProps } from './components/textarea'
export { YmTimePicker, type TimePickerFormat, type TimePickerMode, type TimePickerProps, type TimePickerValue, type TimeRangeValue } from './components/time-picker'
export { YmTreeSelect, type TreeSelectOption, type TreeSelectProps, type TreeSelectValue } from './components/tree-select'
export { YmUpload, uploadFiles, type UploadFile, type UploadFileEvent, type UploadFilesOptions, type UploadProps,
  type UploadRequestContext, type UploadRequestOptions, type UploadResponse, type UploadResult, type UploadValidation } from './components/upload'
export { default as ConfigProvider } from './components/config-provider/ConfigProvider.vue'
export type { ConfigProviderProps, ControlSize, ThemeColors, ThemeMode } from './components/config-provider/types'

export const version = packageVersion
