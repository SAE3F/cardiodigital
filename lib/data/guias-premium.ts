import { type GuiaLocal } from '@/lib/offline-db'

export const guiasPremium: Partial<GuiaLocal>[] = [
  {
    titulo: 'Consenso de Síndromes Coronarios Crónicos Actualización 2025',
    categoria: 'Cardiología Clínica',
    fuente: 'SAC',
    anio_publicacion: 2025,
    resumen_rapido: 'Actualización en el manejo integral, diagnóstico no invasivo y tratamiento médico óptimo del Síndrome Coronario Crónico.',
    contenido_md: `
## Mensajes Esenciales
* El término "Síndrome Coronario Crónico" (SCC) refleja la naturaleza dinámica de la enfermedad coronaria, la cual puede tener períodos prolongados de estabilidad clínica pero siempre conlleva un riesgo de desestabilización aguda.
* El pilar fundamental del tratamiento es la adopción de un estilo de vida saludable y el **Tratamiento Médico Óptimo (TMO)**, que mejora el pronóstico y la calidad de vida.
* La isquemia miocárdica no siempre es causada por enfermedad coronaria epicárdica obstructiva; debe considerarse la disfunción microvascular y el vasoespasmo (INOCA).

## Evaluación Inicial y Diagnóstico
La evaluación de un paciente con sospecha de SCC requiere un enfoque secuencial:
1. **Evaluación Clínica:** Historia clínica detallada, caracterización del dolor (típico, atípico, no anginoso) y evaluación de comorbilidades.
2. **Probabilidad Pretest (PTP):** Utilizar modelos validados que incluyan edad, sexo y tipo de síntomas, además de factores de riesgo como el Score de Calcio Coronario.
3. **Pruebas Funcionales y Anatómicas:** 
   - *Baja/Intermedia PTP:* Preferir AngioTAC coronaria para descartar enfermedad anatómica o pruebas de isquemia con apremio (Eco-estrés, SPECT, PET).
   - *Alta PTP / Angina Refractaria:* Considerar cinecoronariografía (CCG) directa, especialmente si se asocia a disfunción ventricular izquierda grave.

## Estratificación de Riesgo
Se debe determinar el riesgo de eventos cardiovasculares mayores (MACE).
* **Riesgo Alto (>3% mortalidad anual):** Isquemia extensa (>10% del VI) en pruebas funcionales, enfermedad de tronco o de tres vasos proximales, o fracción de eyección reducida (<35%) de origen isquémico.
* **Riesgo Bajo (<1% mortalidad anual):** Sin isquemia demostrable o mínima, función ventricular preservada.

## Tratamiento Médico Óptimo (TMO)
El tratamiento farmacológico se divide en dos grandes objetivos:

### 1. Alivio de Síntomas (Antianginosos)
* **Primera Línea:** Betabloqueantes (BB) o Bloqueantes Cálcicos (BCC). Se pueden combinar si no hay control.
* **Segunda Línea:** Nitratos de acción prolongada, Trimetazidina, Ivabradina o Ranolazina, según tolerancia, frecuencia cardíaca y presión arterial.
* *Nitratos de acción corta (Nitroglicerina sublingual):* Indicados en todos los pacientes para el rescate del episodio anginoso agudo.

### 2. Prevención de Eventos
* **Antiagregación Plaquetaria:** Aspirina (AAS) 75-100 mg/día. En intolerantes, Clopidogrel 75 mg/día. Se puede considerar doble antiagregación (DAPT) o AAS + Rivaroxabán a dosis bajas en pacientes con alto riesgo isquémico y bajo riesgo de sangrado.
* **Estatinas:** Dosis de alta intensidad (Rosuvastatina 20-40 mg, Atorvastatina 40-80 mg). Objetivo de LDL < 55 mg/dL. Si no se alcanza, sumar Ezetimibe.
* **iECA/ARA-II:** Especialmente indicados si coexiste hipertensión, diabetes, enfermedad renal crónica o disfunción del VI.

## Revascularización
La revascularización (ATC o CRM) debe considerarse **además** del TMO cuando:
1. Hay síntomas persistentes inaceptables a pesar del TMO.
2. Existe una anatomía de alto riesgo que impacta en la supervivencia (Ej. Tronco de la CI >50%, DA proximal >50%, disfunción ventricular asociada a isquemia).
*La revascularización rutinaria en pacientes con enfermedad estable y riesgo anatómico bajo/moderado no ha demostrado mejorar la sobrevida global frente al TMO exclusivo (Trial ISCHEMIA).*
`
  },
  {
    titulo: 'Consenso Fibrilación Auricular 2025',
    categoria: 'Arritmias y Fibrilación Auricular',
    fuente: 'SAC',
    anio_publicacion: 2025,
    resumen_rapido: 'Nuevos paradigmas en el manejo de la FA: control temprano del ritmo, ablación y prevención de eventos tromboembólicos.',
    contenido_md: `
## Mensajes Esenciales
* La Fibrilación Auricular (FA) es la arritmia sostenida más común y se asocia con un aumento significativo de la morbimortalidad, principalmente por accidente cerebrovascular (ACV) y disfunción ventricular.
* El abordaje holístico se resume en el esquema **ABC**: **A**nticoagulation/Avoid stroke (Prevención del ACV), **B**etter symptom management (Control de frecuencia y ritmo), y **C**ardiovascular and Comorbidity optimization (Control de factores de riesgo).
* Se prioriza el **control temprano del ritmo** (cardioversión, antiarrítmicos o ablación con catéter) frente al control de frecuencia en pacientes sintomáticos o de reciente comienzo, para evitar el remodelado auricular progresivo.

## Diagnóstico y Evaluación
* Se requiere documentación electrocardiográfica: un ECG de 12 derivaciones o un trazado de derivación única ≥ 30 segundos que muestre ritmo irregular sin ondas P claras.
* **Evaluación Clínica:** Identificar síntomas (Score EHRA), factores desencadenantes y comorbilidades (obesidad, SAOS, hipertensión, consumo de alcohol).
* Ecocardiograma transtorácico obligatorio para evaluar tamaño auricular, función ventricular y descartar valvulopatías (FA valvular vs. no valvular).

## Prevención Tromboembólica (A)
* Evaluar riesgo isquémico con el score **CHA₂DS₂-VASc**. 
* En pacientes sin prótesis mecánicas ni estenosis mitral moderada/severa:
  - Riesgo ≥ 2 en hombres o ≥ 3 en mujeres: **Anticoagulación fuertemente recomendada**.
  - Riesgo 1 en hombres o 2 en mujeres: Considerar anticoagulación.
* **DOACs** (Apixabán, Dabigatrán, Rivaroxabán, Edoxabán) son de **primera elección** sobre los antagonistas de la vitamina K (Acenocumarol/Warfarina), por menor riesgo de sangrado intracraneal y mayor comodidad.

## Control de Síntomas: Ritmo vs. Frecuencia (B)
### Control de Frecuencia
* Objetivo inicial laxo: FC en reposo < 110 lpm.
* Fármacos de primera línea: Betabloqueantes o Calcioantagonistas no dihidropiridínicos (Diltiazem/Verapamilo). Digoxina en casos de fracción de eyección reducida o inactividad física.

### Control de Ritmo
* Fuertemente recomendado en FA de reciente diagnóstico, pacientes jóvenes, taquimiocardiopatía y aquellos que permanecen sintomáticos bajo control de frecuencia.
* Fármacos: Flecainida/Propafenona (corazones sanos), Amiodarona (cardiopatía estructural).
* **Ablación con Catéter:** Indicación clase I como primera línea en pacientes seleccionados o tras fallo de drogas antiarrítmicas. Demostró superioridad para mantener el ritmo sinusal.

## Manejo de Comorbilidades (C)
El tratamiento de la FA falla si no se corrigen las causas subyacentes:
* Reducción de peso (objetivo BMI < 27).
* Tratamiento agresivo de la Hipertensión Arterial.
* Screening y tratamiento del Síndrome de Apnea Obstructiva del Sueño (SAOS).
* Restricción del consumo de alcohol.
`
  },
  {
    titulo: 'Consenso de Síndromes Coronarios Agudos',
    categoria: 'Cardiología Clínica',
    fuente: 'SAC',
    anio_publicacion: 2026,
    resumen_rapido: 'Protocolo de manejo integral de los Síndromes Coronarios Agudos (SCASEST y IAMCEST) en guardia.',
    contenido_md: `
## Mensajes Esenciales
* El tiempo es músculo: La identificación rápida mediante ECG en los primeros 10 minutos desde el primer contacto médico es vital.
* Se elimina progresivamente la distinción estricta retrospectiva y se enfoca en el triage electrocardiográfico inicial: **Con supradesnivel del ST (IAMCEST)** y **Sin supradesnivel del ST (SCASEST)**.
* La troponina de alta sensibilidad (hs-cTn) con algoritmos de 0/1h o 0/2h es la norma para el descarte (rule-out) o confirmación (rule-in) rápido de infarto en urgencias.

## Diagnóstico y Triage Rápido
1. **ECG de 12 derivaciones:** Realizar e interpretar en < 10 min. Si es inespecífico y alta sospecha, repetir cada 15-30 min y solicitar derivaciones posteriores (V7-V9) y derechas (V3R-V4R).
2. **Biomarcadores (hs-cTn):**
   - Extraer al momento cero. Si los valores son extremadamente bajos, se puede dar el alta segura (Rule-out).
   - Si se requiere segunda extracción a la hora o a las 2 horas, evaluar el delta (cambio) para descartar o confirmar injuria aguda.
3. **Estratificación de Riesgo:** Utilizar scores validados clínicos y electrocardiográficos (TIMI, GRACE) para decidir el momento del intervencionismo.

## Manejo del SCASEST (Sin Elevación ST)
El tratamiento inmediato incluye:
* **Antiisquémicos:** Betabloqueantes tempranos (si no hay contraindicaciones, Killip I), Nitratos para dolor.
* **Antiagregación:** AAS + Inhibidor P2Y12 (Ticagrelor o Prasugrel de preferencia sobre Clopidogrel).
* **Anticoagulación:** Enoxaparina, Fondaparinux o Heparina no fraccionada durante la internación o hasta la revascularización.

### Timing de Revascularización (CCG)
* **Invasiva Inmediata (< 2h):** Inestabilidad hemodinámica (shock), angina refractaria, arritmias ventriculares graves, insuficiencia cardíaca aguda por isquemia.
* **Invasiva Temprana (< 24h):** Infarto confirmado por troponinas, cambios dinámicos del ST, score GRACE > 140.
* **Invasiva Electiva:** Riesgo intermedio, previo a pruebas funcionales.

## Manejo del IAMCEST (Con Elevación ST)
El objetivo prioritario es abrir la arteria ocluida lo antes posible.
1. **Redes de Infarto:** El diagnóstico prehospitalario activa el traslado directo a sala de hemodinamia (bypass de la guardia).
2. **Estrategia de Reperfusión:**
   - **Angioplastia Primaria (ATC):** Elección de oro si se puede garantizar el cruce de la cuerda (tiempo puerta-balón) en **< 90 minutos** en centros con hemodinamia, o **< 120 minutos** si el paciente requiere traslado.
   - **Fibrinolisis:** Si la ATC primaria no está disponible dentro de los 120 minutos. Administrar en < 10 minutos (tiempo puerta-aguja). Tras la fibrinolisis, derivar siempre a centro con hemodinamia (Estrategia Farmacoinvasiva).
3. Tratamiento coadyuvante: AAS, inhibidor P2Y12 potente (Prasugrel/Ticagrelor), anticoagulación periprocedimiento. Estatinas de alta intensidad desde el primer día.
`
  }
]
