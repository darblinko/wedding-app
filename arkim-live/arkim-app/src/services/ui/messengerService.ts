import { MessageType } from '../../components/contexts/MessengerContext';

// Define the types of handlers that will be set by the provider
type MessageHandler = (message: string, title?: string) => void;
type ConfirmHandler = (
  message: string, 
  title?: string, 
  onConfirm?: () => void, 
  onCancel?: () => void,
  confirmButtonText?: string,
  cancelButtonText?: string
) => void;

/**
 * Global Messenger service that can be used outside React components
 * This service will be initialized by the MessengerProvider during app bootstrap
 */
class MessengerService {
  private static messageHandler: MessageHandler | null = null;
  private static errorHandler: MessageHandler | null = null;
  private static warningHandler: MessageHandler | null = null;
  private static successHandler: MessageHandler | null = null;
  private static confirmHandler: ConfirmHandler | null = null;

  /**
   * Set the handlers from the MessengerProvider
   * This should be called only by the MessengerProvider
   */
  public static setHandlers(
    messageHandler: MessageHandler,
    errorHandler: MessageHandler,
    warningHandler: MessageHandler,
    successHandler: MessageHandler,
    confirmHandler: ConfirmHandler
  ): void {
    MessengerService.messageHandler = messageHandler;
    MessengerService.errorHandler = errorHandler;
    MessengerService.warningHandler = warningHandler;
    MessengerService.successHandler = successHandler;
    MessengerService.confirmHandler = confirmHandler;
  }

  /**
   * Show an information message
   */
  public static message(message: string, title?: string): void {
    if (MessengerService.messageHandler) {
      MessengerService.messageHandler(message, title);
    } else {
      console.warn('Messenger service not initialized. Message:', message);
    }
  }

  /**
   * Show an error message
   */
  public static error(message: string, title?: string): void {
    if (MessengerService.errorHandler) {
      MessengerService.errorHandler(message, title);
    } else {
      console.error('Messenger service not initialized. Error:', message);
    }
  }

  /**
   * Show a warning message
   */
  public static warning(message: string, title?: string): void {
    if (MessengerService.warningHandler) {
      MessengerService.warningHandler(message, title);
    } else {
      console.warn('Messenger service not initialized. Warning:', message);
    }
  }

  /**
   * Show a success message
   */
  public static success(message: string, title?: string): void {
    if (MessengerService.successHandler) {
      MessengerService.successHandler(message, title);
    } else {
      console.warn('Messenger service not initialized. Success:', message);
    }
  }

  /**
   * Show a confirmation dialog
   */
  public static confirm(
    message: string, 
    title?: string,
    onConfirm?: () => void, 
    onCancel?: () => void,
    confirmButtonText: string = 'Confirm',
    cancelButtonText: string = 'Cancel'
  ): void {
    if (MessengerService.confirmHandler) {
      MessengerService.confirmHandler(
        message, 
        title, 
        onConfirm, 
        onCancel, 
        confirmButtonText, 
        cancelButtonText
      );
    } else {
      console.warn('Messenger service not initialized. Confirmation:', message);
    }
  }
}

export default MessengerService;