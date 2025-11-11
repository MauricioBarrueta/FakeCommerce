import { ProductsData } from "../../products/interface/products.interface";

export interface PurchaseInterface {
    id: number
    date: string
    items: ProductsData[]
    total: number
    status: 'Pendiente' | 'Entregado' | 'Enviado' | 'Cancelada'
}