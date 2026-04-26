import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Bloque extends Nodo {
    constructor(public instrucciones: Nodo[], linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        // Se crea un sub-entorno para que las variables aquí dentro
        // mueran al terminar el bloque, justo como pide la prueba.
        const entornoLocal = new Entorno(entorno);
        
        for (const inst of this.instrucciones) {
            const resultado = inst.ejecutar(entornoLocal);
            // Si el bloque está dentro de un For/If y se lanza break/continue/return,
            // lo propagamos hacia arriba para que la instrucción padre decida qué hacer.
            if (resultado != null) return resultado; 
        }
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="Bloque Anónimo"];\n${nombrePadre} -> ${id};\n`;
        this.instrucciones.forEach(inst => { dot += inst.obtenerAST(id); });
        return dot;
    }
}