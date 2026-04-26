import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Case {
    constructor(public valorMatch: Nodo | null, public instrucciones: Nodo[], public linea: number, public columna: number) {}
}

export class Switch extends Nodo {
    constructor(public expresion: Nodo, public casos: Case[], linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const valorSwitch = this.expresion.ejecutar(entorno);
        let casoCumplido = false;

        for (const caso of this.casos) {
            // Si es default (valorMatch nulo) o coincide el valor
            if (caso.valorMatch === null || caso.valorMatch.ejecutar(entorno) === valorSwitch) {
                casoCumplido = true;
                const entornoLocal = new Entorno(entorno);
                
                for (const inst of caso.instrucciones) {
                    const resultado = inst.ejecutar(entornoLocal);
                    if (resultado === 'break') return null; // El break rompe el switch
                    if (resultado != null) return resultado; // Propaga returns
                }
                break; // GoScript no tiene "fallthrough" automático, se sale al cumplir uno
            }
        }
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="Switch"];\n${nombrePadre} -> ${id};\n`;
        dot += this.expresion.obtenerAST(id);
        return dot;
    }
}