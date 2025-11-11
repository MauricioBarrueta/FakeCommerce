export interface ModalInterface {
    icon: string,
    title: string,
    text: string,
    isAlert: boolean,
    type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    confirmText?: string,
    cancelText?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
}