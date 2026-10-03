'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, Users, Vote, CheckCircle } from 'lucide-react'
import {
  MEMBER_TYPES, ASSOCIATION_ROLES,
  type MemberTypeKey, type AssociationRoleKey,
} from '@/lib/association-roles'

interface Props {
  memberId:         string
  memberName:       string
  initialType:      MemberTypeKey
  initialRoles:     AssociationRoleKey[]
}

export function AssociationRoleEditor({ memberId, memberName, initialType, initialRoles }: Props) {
  const router = useRouter()
  const [type,  setType]  = useState<MemberTypeKey>(initialType)
  const [roles, setRoles] = useState<AssociationRoleKey[]>(initialRoles)
  const [saving, setSaving] = useState(false)

  function toggleRole(key: AssociationRoleKey) {
    setRoles(r => r.includes(key) ? r.filter(k => k !== key) : [...r, key])
  }

  function handleTypeChange(newType: MemberTypeKey) {
    setType(newType)
    // Si on rétrograde vers ADHERENT → vider les rôles
    if (newType === 'ADHERENT') setRoles([])
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          memberType:       type,
          associationRoles: type === 'ADHERENT' ? [] : roles,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? 'Erreur serveur')
      }
      toast.success(`Classification de ${memberName} mise à jour.`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur lors de la mise à jour.')
    } finally {
      setSaving(false)
    }
  }

  const bureau  = ASSOCIATION_ROLES.filter(r => r.group === 'BUREAU')
  const comites = ASSOCIATION_ROLES.filter(r => r.group === 'COMITE')
  const changed = type !== initialType ||
    roles.length !== initialRoles.length ||
    roles.some(r => !initialRoles.includes(r)) ||
    initialRoles.some(r => !roles.includes(r))

  return (
    <div className="card-dark mb-6">
      <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
        <Vote size={18} className="text-major-primary" /> Classification associative
      </h2>

      {/* Type membre */}
      <div className="mb-5">
        <p className="text-gray-400 text-xs font-inter uppercase tracking-widest mb-2">Type</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MEMBER_TYPES.map(def => {
            const active = type === def.key
            return (
              <button
                key={def.key}
                type="button"
                onClick={() => handleTypeChange(def.key)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  active ? `${def.cardBg} ${def.cardBorder} ring-2 ${def.ring}`
                         : 'bg-major-black/30 border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0">{def.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-oswald text-sm uppercase tracking-wider ${active ? def.chipText : 'text-white'}`}>
                      {def.label}
                    </p>
                    <p className="text-gray-400 font-inter text-xs leading-relaxed mt-0.5">{def.description}</p>
                  </div>
                  {active && <CheckCircle size={16} className={`flex-shrink-0 ${def.chipText}`} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rôles bureau + comités — visibles uniquement si MEMBRE_ASSOCIATION */}
      {type === 'MEMBRE_ASSOCIATION' && (
        <>
          <div className="mb-5">
            <p className="text-gray-400 text-xs font-inter uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Users size={11} /> Bureau exécutif
              <span className="text-gray-600 normal-case tracking-normal text-[10px]">(optionnel, multi-sélection)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {bureau.map(def => {
                const active = roles.includes(def.key as AssociationRoleKey)
                return (
                  <button
                    key={def.key}
                    type="button"
                    onClick={() => toggleRole(def.key as AssociationRoleKey)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter border transition-colors ${
                      active ? `${def.chipBg} ${def.chipBorder} ${def.chipText} font-semibold`
                             : 'bg-major-black/30 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    <span>{def.emoji}</span> {def.label}
                    {active && <CheckCircle size={11} />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-gray-400 text-xs font-inter uppercase tracking-widest mb-2">
              Comités <span className="text-gray-600 normal-case tracking-normal text-[10px]">(optionnel, multi-sélection)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {comites.map(def => {
                const active = roles.includes(def.key as AssociationRoleKey)
                return (
                  <button
                    key={def.key}
                    type="button"
                    onClick={() => toggleRole(def.key as AssociationRoleKey)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter border transition-colors ${
                      active ? `${def.chipBg} ${def.chipBorder} ${def.chipText} font-semibold`
                             : 'bg-major-black/30 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    <span>{def.emoji}</span> {def.label}
                    {active && <CheckCircle size={11} />}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving || !changed}
        className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Save size={14} />
        {saving ? 'Enregistrement…' : 'Enregistrer la classification'}
      </button>
    </div>
  )
}
