/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Command from '../Command'

class AddFlowmapNode extends Command {
  static types = {
    java: ['APP_AGENT', 'Application Server'],
    nodejs: ['NODEJS_APP_AGENT', 'Node.JS Server'],
    php: ['PHP_APP_AGENT', 'PHP Application Server'],
    python: ['PYTHON_APP_AGENT', 'Python Server'],
    native: ['NATIVE_SDK', 'C/C++ SDK'],
    dotnet: ['DOT_NET_APP_AGENT', '.NET Application Server'],
    go: ['GOLANG_SDK', 'Golang SDK'],
    wmb: ['WMB_AGENT', 'WMB Agent']
  }

  constructor(name, type = 'java', nodeCount = 1, cpm = 50, art = 100, x = 400, y = 400) {
    super()
    this.name = name
    this.nodeCount = nodeCount
    this.cpm = cpm
    this.art = art
    this.type = type.toLowerCase()
    this.position = {
      x: parseInt(x),
      y: parseInt(y),
      z: 0
    }
  }

  isApplicableForGroup(group) {
    return group === 'ajax' || group === '*'
  }

  isAvailable(featureFlags) {
    return featureFlags.hookIntoAjax === true
  }

  getRequiredFlags() {
    return 'Hook into Ajax'
  }

  apply(target, key) {
    const id = Math.floor(Math.random() * (73741824) + 1000000000)

    const [agentType, componentType] = AddFlowmapNode.types[this.type]

    const patch = [{
      op: 'add',
      path: '/nodes/-',
      value: {
        id: 'Type:APPLICATION_COMPONENT, id:' + id,
        flowMapNodeType: 'MAIN_DASHBOARD_NODE',
        name: this.name,
        viewPermission: true,
        preferenceValue: {
          position: this.position,
          uid: 'Type:APPLICATION_COMPONENT, id:' + id,
          hidden: false,
          groupable: false
        },
        nodeDegree: 0,
        $$edges: null,
        x: 0,
        y: 0,
        idNum: id,
        entityType: 'APPLICATION_COMPONENT',
        agentType: agentType,
        componentType: componentType,
        productType: agentType,
        platform: null,
        language: null,
        backendType: null,
        doNotResolve: false,
        nodeCount: this.nodeCount,
        componentCount: 0,
        startComponent: false,
        percentTimeDistribution: 0,
        requestedEntity: false,
        dbBackendInfo: null,
        onSnapshotFlow: false,
        requestSegmentDataItems: null,
        eumSnapshotData: null,
        crossApplicationSnapshots: null,
        dbMonSnapshotCorrelationData: null,
        exitEntities: null,
        exitPointCall: null,
        stats: {
          averageResponseTime: {
            metricValue: this.art,
            metricId: 32308651
          },
          callsPerMinute: {
            metricValue: this.cpm,
            metricId: 32308652
          },
          errorsPerMinute: {
            metricValue: -1,
            metricId: -1
          },
          numberOfErrors: {
            metricValue: 0,
            metricId: -1
          },
          numberOfCalls: {
            metricValue: 2998,
            metricId: -1
          },
          transactionStats: null,
          asyncTransactionStats: null
        },
        baselineStats: {
          averageResponseTime: {
            metricId: 32308651,
            value: 0.0,
            standardDeviation: 0.0,
            metricValue: null
          },
          endToEndLatencyTime: {
            metricId: 0,
            value: 0.0,
            standardDeviation: 0.0,
            metricValue: null
          },
          callsPerMinute: {
            metricId: 32308652,
            value: 0.0,
            standardDeviation: 0.0,
            metricValue: null
          },
          errorsPerMinute: {
            metricId: 32308654,
            value: 0.0,
            standardDeviation: 0.0,
            metricValue: null
          },
          numberOfErrors: {
            metricId: -1,
            value: 0.0,
            standardDeviation: 0.0,
            metricValue: {
              value: 0,
              min: 0,
              max: 0,
              current: 0,
              sum: 0,
              count: 0,
              useRange: false,
              groupCount: 0,
              standardDeviation: 0.0,
              occurances: 0
            }
          },
          numberOfCalls: {
            metricId: -1,
            value: 0.0,
            standardDeviation: 0.0,
            metricValue: {
              value: 0,
              min: 0,
              max: 0,
              current: 0,
              sum: 0,
              count: 0,
              useRange: false,
              groupCount: 0,
              standardDeviation: 0.0,
              occurances: 0
            }
          },
          artDefined: false
        },
        componentHealthStats: {
          normalNodes: 0,
          warningNodes: 0,
          criticalNodes: 1,
          unknownNodes: 0
        },
        healthState: null,
        componentThreadStats: [{
          name: 'ThreadSpawn',
          stats: {
            averageResponseTime: {
              metricValue: 0,
              metricId: 32309015
            },
            callsPerMinute: {
              metricValue: 29,
              metricId: 32309017
            },
            errorsPerMinute: {
              metricValue: -1,
              metricId: -1
            },
            numberOfErrors: {
              metricValue: -1,
              metricId: -1
            },
            numberOfCalls: {
              metricValue: 1746,
              metricId: -1
            },
            transactionStats: null,
            asyncTransactionStats: null
          }
        }],
        hasTransactionStats: false,
        incidentSummary: null,
        transactionSummary: null,
        overallState: null,
        isAgentUp: false,
        netVizGraphNode: null,
        nodeGroup: false,
        $$groupItems: null,
        isExternalEntity: false,
        remoteUrl: null,
        accountName: null,
        externalProtocol: null,
        remoteEntityId: 0,
        remoteSegmentReferenceItems: null,
        externalEntity: false,
        agentUp: false
      }
    }]

    target.add('patchAjaxResponse', { urlPattern: '*/applicationFlowMapUiService/*', patch })

    /*
    const [agentType, componentType] = AddFlowmapNode.types[this.type]

    const id = Math.floor(Math.random() * (73741824) + 1000000000)

    target.add(function (url, response, context) {
      if (!url.match(i)) {
        return response
      }

      const j = JSON.parse(response)
      const from = j.nodes.find(x => x.id.startsWith('Type:APPLICATION_COMPONENT'))
      if (typeof from === 'undefined') {
        console.log('Could not find node.')
        return response
      }

      const node = JSON.parse(JSON.stringify(from))
      node.name = context.name
      node.id = 'Type:APPLICATION_COMPONENT, id:' + context.id
      // node.preferenceValue.position.x = 400
      // node.preferenceValue.position.y = 100
      node.agentType = context.agentType
      node.componentType = context.componentType
      node.productType = context.agentType
      j.nodes.push(node)
      return JSON.stringify(j)
    }, { name: this.name, agentType, componentType, id })

    return false
    */
    return false
  }
}

export default AddFlowmapNode
