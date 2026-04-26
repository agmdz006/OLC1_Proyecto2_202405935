import { Tipo } from '../ast/Tipo'

export class Simbolo {
    constructor(
        public id: string,
        public valor: any,
        public tipo: Tipo | string
    ) {}
}