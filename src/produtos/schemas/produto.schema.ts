import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Produto extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true }) // Remove unique: true
  slug: string;

  @Prop({ required: false })
  image: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ default: true })
  available: boolean;

  @Prop({ default: 0, type: Number })
  preparationTime: number; 

  @Prop({ required: false })
  ingredients: string;

  @Prop({ required: false })
  allergens: string;

  @Prop({ default: 0, type: Number })
  calories: number;

  @Prop({ default: 0, type: Number, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0, type: Number })
  reviewCount: number;

  @Prop({ required: false })
  storeId: string; 
}

export const ProdutoSchema = SchemaFactory.createForClass(Produto);

// Middleware para converter categoria para lowercase antes de salvar
ProdutoSchema.pre('save', function(next) {
  if (this.category) {
    this.category = this.category.toLowerCase();
  }
  next();
});

ProdutoSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();

  if (update && typeof update === 'object' && !Array.isArray(update)) {
    if (update.category) {
      update.category = update.category.toLowerCase();
    } else if (update.$set && update.$set.category) {
      update.$set.category = update.$set.category.toLowerCase();
    }
  }
  next();
});

// índices
ProdutoSchema.index({ category: 1, available: 1 });
ProdutoSchema.index({ rating: -1, reviewCount: -1 });
// Índice composto para garantir nome único por loja
ProdutoSchema.index({ name: 1, storeId: 1 }, { unique: true });
// Índice composto para garantir slug único por loja
ProdutoSchema.index({ slug: 1, storeId: 1 }, { unique: true });