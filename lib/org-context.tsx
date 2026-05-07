"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Organization } from "@/lib/types"

interface OrgContextType {
  organizations: Organization[]
  currentOrg: Organization | null
  setCurrentOrg: (org: Organization) => void
  isLoading: boolean
}

const OrgContext = createContext<OrgContextType | undefined>(undefined)

export function OrgProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadOrgs() {
      const supabase = createClient()
      
      const { data: userOrgs } = await supabase
        .from("user_organizations")
        .select("organization_id")
      
      if (userOrgs && userOrgs.length > 0) {
        const orgIds = userOrgs.map(uo => uo.organization_id)
        const { data: orgs } = await supabase
          .from("organizations")
          .select("*")
          .in("id", orgIds)
        
        if (orgs) {
          setOrganizations(orgs)
          // Check localStorage for previously selected org
          const savedOrgId = localStorage.getItem("drishti_current_org")
          const savedOrg = orgs.find(o => o.id === savedOrgId)
          setCurrentOrgState(savedOrg || orgs[0])
        }
      }
      setIsLoading(false)
    }

    loadOrgs()
  }, [])

  const setCurrentOrg = (org: Organization) => {
    setCurrentOrgState(org)
    localStorage.setItem("drishti_current_org", org.id)
  }

  return (
    <OrgContext.Provider value={{ organizations, currentOrg, setCurrentOrg, isLoading }}>
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  const context = useContext(OrgContext)
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider")
  }
  return context
}
