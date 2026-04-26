import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Funcion extends Nodo {
    constructor(
        public id: string,
        public parametros: { id: string, tipo: string }[],
        public tipoRetorno: string,
        public bloque: Nodo[],
        linea: number, columna: number
    ) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        // Guardamos la función en el entorno global. El "valor" es la propia clase Función.
        entorno.guardar(this.id, this, 'funcion');
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="Func\\n${this.id}"];\n${nombrePadre} -> ${id};\n`;
        const idBloque = `nodo_${Singleton.getInstancia().contadorAst++}`;
        dot += `${idBloque} [label="Bloque"];\n${id} -> ${idBloque};\n`;
        this.bloque.forEach(inst => { dot += inst.obtenerAST(idBloque); });
        return dot;
    }
}