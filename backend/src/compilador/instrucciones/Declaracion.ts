import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Declaracion extends Nodo {
    constructor(
        public id: string, 
        public tipo: string | null, 
        public valorInicial: Nodo | null, 
        linea: number, columna: number
    ) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        let valorFinal = null;

        if (this.valorInicial) {
            valorFinal = this.valorInicial.ejecutar(entorno);
        } else {
            // Valores por defecto de GoScript
            if (this.tipo === 'int' || this.tipo === 'float64') valorFinal = 0;
            if (this.tipo === 'string') valorFinal = "";
            if (this.tipo === 'bool') valorFinal = false;
        }

        entorno.guardar(this.id, valorFinal, this.tipo || 'any');
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="Declaración\\n${this.id}"];\n${nombrePadre} -> ${id};\n`;
        if (this.valorInicial) dot += this.valorInicial.obtenerAST(id);
        return dot;
    }
}