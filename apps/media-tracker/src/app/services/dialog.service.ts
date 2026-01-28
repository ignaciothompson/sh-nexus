import { Injectable, Type } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogOptions<D = unknown> {
  data?: D;
  size?: DialogSize;
}

const SIZE_WIDTH_MAP: Record<DialogSize, string> = {
  sm: '300px',
  md: '500px',
  lg: '700px',
  xl: '900px',
  full: 'calc(100vw - 2rem)',
};

/**
 * Dialog Service
 * Wrapper around Angular CDK Dialog for consistent modal handling
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private dialog: Dialog) {}

  /**
   * Open a modal component
   * @param component - The component to open as modal
   * @param options - Dialog options or direct data object
   */
  open<T>(
    component: ComponentType<T>,
    options?: DialogOptions | unknown
  ): DialogRef<unknown, T> {
    // Handle legacy format (direct data) vs new format (with options)
    let data: unknown;
    let size: DialogSize = 'md';

    if (options && typeof options === 'object' && 'data' in options) {
      // New format with DialogOptions
      const opts = options as DialogOptions;
      data = opts.data;
      size = opts.size || 'md';
    } else {
      // Legacy format (direct data)
      data = options;
    }

    return this.dialog.open(component, {
      data,
      width: SIZE_WIDTH_MAP[size],
      maxWidth: '95vw',
      maxHeight: '90vh',
      backdropClass: 'cdk-overlay-dark-backdrop',
      panelClass: ['sh-modal', `sh-modal-${size}`],
    });
  }

  /**
   * Close all open dialogs
   */
  closeAll(): void {
    this.dialog.closeAll();
  }
}
