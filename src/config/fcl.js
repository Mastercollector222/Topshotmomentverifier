import { config } from "@onflow/fcl";

// Configure FCL for Flow mainnet with QuickNode
config()
  // Primary access node - QuickNode
  .put("accessNode.api", "https://tame-withered-dinghy.flow-mainnet.quiknode.pro/649d8a6cc7fe28ef47bc69d33ee14ba18427fd8c/")
  // Fallback access nodes
  .put("accessNode.api.1", "https://rest-mainnet.onflow.org")
  .put("accessNode.api.2", "https://mainnet.onflow.org")
  .put("flow.network", "mainnet")
  .put("fcl.limit", 9999)
  .put("fcl.scriptGas", 100000)
  // Use sealed blocks instead of 'final' to avoid 400 errors
  .put("block.finality", "sealed")
  // Enhanced retry strategy for rate limiting (429 errors)
  .put("http.rpc.retries", 10) // Increase max retries
  .put("http.rpc.timeout", 15000) // Increase timeout
  .put("http.rpc.retry.initial.backoff", 1000) // Start with 1 second backoff
  .put("http.rpc.retry.max.backoff", 10000) // Max 10 second backoff
  .put("http.rpc.retry.backoff.factor", 2) // Exponential backoff factor
  .put("http.rpc.retry.jitter", true) // Add jitter to avoid thundering herd
  // Rate limiting settings
  .put("sdk.transport.rate.limit", 10) // Limit to 10 requests per interval
  .put("sdk.transport.rate.interval", 5000) // 5 second interval
  // Authentication improvements
  .put("challenge.handshake", true)
  .put("service.OpenID.scopes", "email")
  .put("fcl.eventPollingInterval", 2000)
  // WalletConnect configuration
  .put("discovery.wallet.method.walletconnect.key", "9226bbf841761b926570268c05813821")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")
  .put("app.detail.title", "NBA Top Shot Moment Verifier")
  .put("app.detail.icon", "https://placekitten.com/g/200/200")
  .put("0xTopShot", "0x0b2a3299cc857e29") // TopShot contract address on mainnet
  .put("0xMetadataViews", "0x1d7e57aa55817448"); // MetadataViews contract address on mainnet

// Note: You'll need to use a mainnet account with NBA Top Shot moments for testing
// You can create a testnet account at https://testnet-faucet.onflow.org/
