import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class InstanciaSlice extends Nodo {
    constructor(public tipo: string, public expresiones: Nodo[], linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const arreglo: any[] = [];
        
        // Metemos cada valor evaluado en un arreglo nativo de TS
        for (const expr of this.expresiones) {
            arreglo.push(expr.ejecutar(entorno));
        }
        
        return arreglo; // Al retornar un Array nativo, el ForRange funcionará 
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        return `${id} [label="Instancia Slice ${this.tipo}"];\n${nombrePadre} -> ${id};\n`;
    }
}