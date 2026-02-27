import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InventoryItem } from '../../models/inventory-item.model';
import { CATEGORIES } from '../../utils/constants';

export interface ItemFormDialogData {
  mode: 'create' | 'edit';
  item?: InventoryItem;
}

@Component({
  selector: 'app-item-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './item-form-dialog.component.html',
  styleUrl: './item-form-dialog.component.scss',
})
export class ItemFormDialogComponent implements OnInit {
  form!: FormGroup;
  categories = CATEGORIES;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ItemFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ItemFormDialogData
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.data.mode === 'edit';

    this.form = this.fb.group({
      name: [this.data.item?.name || '', [Validators.required, Validators.maxLength(200)]],
      sku: [
        { value: this.data.item?.sku || '', disabled: this.isEditMode },
        [Validators.required, Validators.maxLength(50)],
      ],
      category: [this.data.item?.category || '', [Validators.required]],
      price: [this.data.item?.price ?? 0, [Validators.required, Validators.min(0)]],
      quantity: [
        this.data.item?.quantity ?? 0,
        [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*$')],
      ],
    });
  }

  onSave(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      this.dialogRef.close(formValue);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
