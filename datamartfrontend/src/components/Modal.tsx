import { FC, ReactNode } from "react";
import { motion } from "framer-motion";

interface ModalButton {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string | ReactNode;
    icon?: ReactNode;
    primaryButton: ModalButton;
    secondaryButton: ModalButton;
}

export const Modal: FC<ModalProps> = ({
                                          isOpen,
                                          onClose,
                                          title,
                                          message,
                                          icon,
                                          primaryButton,
                                          secondaryButton
                                      }) => {
    if (!isOpen) return null;

    const getButtonClasses = (variant: ModalButton['variant'] = 'primary') => {
        const baseClasses = "inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto";

        switch (variant) {
            case 'danger':
                return `${baseClasses} bg-rose-600 text-white hover:bg-rose-500`;
            case 'secondary':
                return `${baseClasses} bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ring-1 ring-inset ring-neutral-300 dark:ring-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-600`;
            default:
                return `${baseClasses} bg-rose-600 text-white hover:bg-rose-500`;
        }
    };

    return (
        <div
            className="relative z-10"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="fixed inset-0 bg-neutral-500/75 transition-opacity backdrop-blur-md"
                aria-hidden="true"
            ></div>

            <motion.div
                className="fixed inset-0 z-10 w-screen overflow-y-auto flex justify-center items-center p-4 sm:p-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-neutral-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white dark:bg-neutral-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            {icon ? (
                                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-rose-100 sm:mx-0 sm:size-10">
                                    {icon}
                                </div>
                            ) : null}
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100" id="modal-title">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    {typeof message === 'string' ? (
                                        <p className="text-start text-sm text-neutral-500 dark:text-neutral-400">
                                            {message}
                                        </p>
                                    ) : (
                                        message
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            onClick={primaryButton.onClick}
                            className={getButtonClasses(primaryButton.variant)}
                        >
                            {primaryButton.label}
                        </button>
                        <button
                            type="button"
                            onClick={secondaryButton.onClick}
                            className={getButtonClasses(secondaryButton.variant)}
                        >
                            {secondaryButton.label}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}