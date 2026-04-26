export class ErrorCompilacion {
    constructor(
        public tipo: string, // Léxico, Sintáctico, Semántico
        public descripcion: string,
        public linea: number,
        public columna: number
    ) {}
}