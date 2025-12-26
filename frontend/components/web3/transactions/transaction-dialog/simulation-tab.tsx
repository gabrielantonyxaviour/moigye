'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, DollarSign, FileText, Loader2 } from 'lucide-react'
import { isTenderlySupported } from '@/lib/web3/tenderly'
import { stringifyWithBigInt, type TabProps } from './types'

export function SimulationTab({ targetChainId, simulation, simulating }: TabProps) {
  if (!isTenderlySupported(targetChainId)) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <p className="text-sm text-orange-600">
              Tenderly simulation is not supported for this network
            </p>
            <p className="text-xs text-muted-foreground">
              Standard transaction simulation was used instead
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!simulation) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          {simulating ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Running simulation...</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No simulation data available</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {simulation.stateChanges && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              State Changes ({simulation.stateChanges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-x-auto max-h-40 overflow-y-auto bg-muted p-2 rounded">
              {stringifyWithBigInt(simulation.stateChanges)}
            </pre>
          </CardContent>
        </Card>
      )}

      {simulation.assetChanges && simulation.assetChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Asset Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-x-auto max-h-40 overflow-y-auto bg-muted p-2 rounded">
              {stringifyWithBigInt(simulation.assetChanges)}
            </pre>
          </CardContent>
        </Card>
      )}

      {simulation.logs && simulation.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Logs ({simulation.logs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-x-auto max-h-40 overflow-y-auto bg-muted p-2 rounded">
              {stringifyWithBigInt(simulation.logs)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full Simulation Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-x-auto max-h-60 overflow-y-auto bg-muted p-2 rounded">
            {stringifyWithBigInt(simulation)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
