"use client"
import { useEffect, useState } from 'react'
import {
  Popover,
  IconButton,
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import WifiRounded from '@mui/icons-material/WifiRounded'
import WifiOffRounded from '@mui/icons-material/WifiOffRounded'
import RefreshRounded from '@mui/icons-material/RefreshRounded'
import { fetchNetcards, setNetcardMon, stopNetcardMon } from '@/app/lib/data'
import { useToast } from './toast'

export const NetcardControl = () => {
  const toast = useToast()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [netcards, setNetcards] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [monitoring, setMonitoring] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = () => fetchNetcards(setNetcards)

  useEffect(() => {
    refresh()
  }, [])

  const open = Boolean(anchorEl)

  const handleEnable = async () => {
    if (!selected) return
    setBusy(true)
    const res = await setNetcardMon(selected)
    setBusy(false)
    if (res.ok) {
      const mon = res.data?.netcard || `${selected}mon`
      setMonitoring(mon)
      toast.success(`Monitor mode enabled on ${mon}`)
      setAnchorEl(null)
    } else {
      toast.error(res.error || 'Could not enable monitor mode')
    }
  }

  const handleDisable = async () => {
    setBusy(true)
    const res = await stopNetcardMon()
    setBusy(false)
    if (res.ok) {
      setMonitoring(null)
      setSelected(null)
      toast.info('Monitor mode disabled')
      setAnchorEl(null)
    } else {
      toast.error(res.error || 'Could not disable monitor mode')
    }
  }

  return (
    <>
      <Tooltip title={monitoring ? `Monitoring on ${monitoring}` : 'Interface idle'}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          className="rounded-lg hover:bg-white/5"
        >
          {monitoring ? (
            <WifiRounded className="text-[color:var(--success)]" />
          ) : (
            <WifiOffRounded className="text-[color:var(--danger)]" />
          )}
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            className:
              'mt-2 w-72 border border-[color:var(--border)] bg-[color:var(--surface)] p-4',
          },
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Network interface</h3>
          <Tooltip title="Refresh interfaces">
            <IconButton size="small" onClick={refresh}>
              <RefreshRounded fontSize="small" className="text-[color:var(--text-dim)]" />
            </IconButton>
          </Tooltip>
        </div>

        {netcards.length === 0 ? (
          <p className="py-4 text-center text-sm text-[color:var(--text-dim)]">
            No interfaces detected.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {netcards.map((nc) => {
              const active = selected === nc
              const isMon = monitoring?.startsWith(nc)
              return (
                <button
                  key={nc}
                  onClick={() => setSelected(active ? null : nc)}
                  disabled={Boolean(monitoring)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                    active
                      ? 'border-brand bg-brand/15 text-white'
                      : 'border-[color:var(--border)] text-[color:var(--text-dim)] hover:border-brand/50 hover:text-white'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="font-mono">{nc}</span>
                  {isMon && (
                    <span className="text-xs font-semibold text-[color:var(--success)]">
                      monitor
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-4">
          {monitoring ? (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={handleDisable}
              disabled={busy}
            >
              {busy ? <CircularProgress size={18} color="inherit" /> : 'Disable monitor mode'}
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={handleEnable}
              disabled={!selected || busy}
            >
              {busy ? <CircularProgress size={18} color="inherit" /> : 'Enable monitor mode'}
            </Button>
          )}
        </div>
      </Popover>
    </>
  )
}
