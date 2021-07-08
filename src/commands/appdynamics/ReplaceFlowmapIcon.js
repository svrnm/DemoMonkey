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
import UndoElement from '../UndoElement'

class ReplaceFlowmapIcon extends Command {
  static icons = {
    // agents
    java: 'images/icon_nodetype_java_100x100.png',
    dotnet: 'images/icon_nodetype_dotnet_100x100.png',
    '.net': 'images/icon_nodetype_dotnet_100x100.png',
    node: 'images/icon_nodetype_node_100x100.png',
    'node.js': 'images/icon_nodetype_node_100x100.png',
    nodejs: 'images/icon_nodetype_node_100x100.png',
    php: 'images/icon_nodetype_php_100x100.png',
    python: 'images/icon_nodetype_python_100x100.png',
    native: 'images/icon_nodetype_native_100x100.png',
    c: 'images/icon_nodetype_native_100x100.png',
    'c++': 'images/icon_nodetype_native_100x100.png',
    webserver: 'images/tierTypes/WebServers.svg',
    apache: 'images/tierTypes/WebServers.svg',
    ruby: 'images/tierTypes/ruby.svg',
    wmb: 'images/icon_nodetype_wmb_100x100.png',
    go: 'images/icon_nodetype_golang_100x100.png',
    golang: 'images/icon_nodetype_golang_100x100.png',
    // backends
    cache: 'svg/cache.svg',
    cassandra: 'svg/cassandra.svg',
    corba: 'svg/corba.svg',
    custom: 'svg/custom.svg',
    db: 'svg/db.svg',
    erp: 'svg/erp.svg',
    esb: 'svg/esb.svg',
    fileserver: 'svg/fileServer.svg',
    http: 'svg/http.svg',
    ldap: 'svg/ldap.svg',
    mailserver: 'svg/mailServer.svg',
    mainframe: 'svg/mainframe.svg',
    messageserver: 'svg/messageserver.svg',
    mod: 'svg/mod.svg',
    queue: 'svg/queue.svg',
    rmi: 'svg/rmi.svg',
    sap: 'svg/sap.svg',
    socket: 'svg/socket.svg',
    sqs: 'svg/sqs.svg',
    thrift: 'svg/thrift.svg',
    tibco: 'svg/tibco.svg',
    'tibco async': 'svg/tibcoAsync.svg',
    topic: 'svg/topic.svg',
    ws: 'svg/ws.svg',
    'amazon aws': 'images/exitPointTypes/amazonAWS.svg',
    'amazon s3': 'images/exitPointTypes/amazonS3.svg',
    'amazon sns': 'images/exitPointTypes/amazonSNS.svg',
    amazonaws: 'images/exitPointTypes/amazonAWS.svg',
    amazons3: 'images/exitPointTypes/amazonS3.svg',
    amazonsns: 'images/exitPointTypes/amazonSNS.svg',
    'cassandra cql': 'images/exitPointTypes/cassandra_CQL.svg',
    mongodb: 'images/exitPointTypes/mongoDB.svg',
    'websphere mq': 'images/exitPointTypes/webSphere_mq.svg'
  }

  constructor(appName, newIcon) {
    super()
    // newIcon can be a boolean if a user writes !replaceFlowmapIcon()
    if (typeof newIcon !== 'string') {
      newIcon = ''
    }
    this.appName = appName
    this.newIcon = ReplaceFlowmapIcon.icons[newIcon.toLowerCase()] ? ReplaceFlowmapIcon.icons[newIcon.toLowerCase()] : newIcon
  }

  apply(node, key) {
    if (this.newIcon !== '' && typeof node[key] === 'string' && node[key].trim() === this.appName) {
      const parent = this._walk(node, 2)
      if (parent !== false) {
        const image = parent.querySelector('image.adsFlowNodeTypeIcon, image.adsFlowMapBackendImage')
        if (image !== null) {
          const original = image.href.baseVal
          image.href.baseVal = this.newIcon
          if (original !== this.newIcon) {
            return new UndoElement(image, 'href.baseVal', original, this.newIcon)
          }
        }
      }
    }
    return false
  }
}

export default ReplaceFlowmapIcon
