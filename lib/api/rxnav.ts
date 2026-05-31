/**
 * Módulo de integración con la API gratuita RxNav del U.S. National Library of Medicine (NIH)
 * Permite buscar fármacos (RxCUIs) y consultar interacciones globales.
 */

const BASE_URL = 'https://rxnav.nlm.nih.gov/REST'

export interface RxNavDrug {
  rxcui: string;
  name: string;
}

export interface RxNavInteraction {
  drugs: [RxNavDrug, RxNavDrug];
  description: string;
  severity: string; // 'high', 'N/A' (no proveen clasificación exacta en la API base, pero 'high' se extrae si está documentado por DrugBank/ONC)
  source: string;
}

/**
 * Busca términos aproximados y devuelve una lista de RxCUIs y nombres.
 * Utiliza el endpoint approximateTerm para tener tolerancia a errores de tipeo o nombres comerciales.
 */
export async function searchDrugsExternally(query: string): Promise<RxNavDrug[]> {
  if (!query || query.length < 3) return []

  try {
    const res = await fetch(`${BASE_URL}/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=20`)
    if (!res.ok) return []
    const data = await res.json()

    // approximateGroup.candidate[].rxcui
    const candidates = data.approximateGroup?.candidate || []
    
    // Obtenemos los RxCUI únicos
    const uniqueRxCuis = Array.from(new Set(candidates.map((c: any) => c.rxcui))) as string[]
    
    // Para cada RxCUI necesitamos su nombre display real (el candidate a veces trae strings raros)
    // Para simplificar y hacer que el autocomplete sea rápido, usamos el nombre proveído por el usuario o el 'score'
    // La forma ideal es pegarle a /rxcui/{rxcui}/properties.json pero haría muchas peticiones.
    // Usaremos el name que trae el candidate o un fetch concurrente rápido
    
    const drugs: RxNavDrug[] = []
    
    // Tomamos los top 15
    const topCuis = uniqueRxCuis.slice(0, 15)
    
    await Promise.all(
      topCuis.map(async (cui) => {
        try {
          const propRes = await fetch(`${BASE_URL}/rxcui/${cui}/properties.json`)
          const propData = await propRes.json()
          const name = propData.properties?.name
          if (name) {
            drugs.push({ rxcui: cui, name })
          }
        } catch (e) {
          console.error("Error fetching properties para RxCUI", cui, e)
        }
      })
    )
    
    return drugs
  } catch (error) {
    console.error('Error fetching RxNav drugs:', error)
    return []
  }
}

/**
 * Consulta las interacciones cruzadas entre una lista de RxCUIs
 */
export async function getExternalInteractions(rxcuis: string[]): Promise<RxNavInteraction[]> {
  if (rxcuis.length < 2) return []

  try {
    const rxcuiString = rxcuis.join('+')
    const res = await fetch(`${BASE_URL}/interaction/list.json?rxcuis=${rxcuiString}`)
    if (!res.ok) return []
    const data = await res.json()

    const interactionsList: RxNavInteraction[] = []

    if (data.fullInteractionTypeGroup) {
      for (const group of data.fullInteractionTypeGroup) {
        const source = group.sourceName || 'NIH'
        
        for (const interactionType of group.fullInteractionType) {
          // Extraemos los dos fármacos involucrados
          const drug1 = interactionType.minConcept[0]
          const drug2 = interactionType.minConcept[1]
          
          for (const interactionPair of interactionType.interactionPair) {
            interactionsList.push({
              drugs: [
                { rxcui: drug1.rxcui, name: drug1.name },
                { rxcui: drug2.rxcui, name: drug2.name }
              ],
              description: interactionPair.description,
              severity: interactionPair.severity || 'Mayor/Relevante',
              source: source
            })
          }
        }
      }
    }

    return interactionsList
  } catch (error) {
    console.error('Error fetching RxNav interactions:', error)
    return []
  }
}
