'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface PatientData {
  age?: number;
  weight?: number;
  gender?: 'M' | 'F';
  isActive: boolean;
}

interface PatientContextType {
  patient: PatientData;
  setPatientData: (data: Partial<PatientData>) => void;
  clearPatient: () => void;
  isPanelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

const defaultPatient: PatientData = { isActive: false }

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientData>(defaultPatient)
  const [isPanelOpen, setPanelOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar desde localStorage al inicializar
  useEffect(() => {
    const saved = localStorage.getItem('cardioguardia_active_patient')
    if (saved) {
      try {
        setPatient(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing patient data', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    if (isLoaded) {
      if (patient.isActive) {
        localStorage.setItem('cardioguardia_active_patient', JSON.stringify(patient))
      } else {
        localStorage.removeItem('cardioguardia_active_patient')
      }
    }
  }, [patient, isLoaded])

  const setPatientData = (data: Partial<PatientData>) => {
    setPatient(prev => ({ ...prev, ...data, isActive: true }))
  }

  const clearPatient = () => {
    setPatient(defaultPatient)
  }

  return (
    <PatientContext.Provider value={{ patient, setPatientData, clearPatient, isPanelOpen, setPanelOpen }}>
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider')
  }
  return context
}
