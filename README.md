# NBA Top Shot Moment Verifier

## Overview

NBA Top Shot Moment Verifier is a web application that allows users to connect their Flow blockchain wallet and verify ownership of NBA Top Shot moments. The application provides two main features:

1. **Moment Browser**: View all NBA Top Shot moments in your collection with filtering options
2. **Ownership Verification**: Verify ownership of specific moments based on customizable criteria

## Features

- **Wallet Integration**: Connect your Flow blockchain wallet (Blocto, Lilico, etc.)
- **Moment Display**: View all your NBA Top Shot moments with detailed information
- **Filtering**: Filter moments by player, team, set, and more
- **Verification Rules**: Verify ownership based on various criteria:
  - Owning moments from specific sets
  - Owning moments of specific players
  - Owning moments from specific teams
  - Owning a minimum number of moments
  - Owning moments with low serial numbers
  - Owning specific play categories (dunks, assists, etc.)
  - Owning specific moment IDs

## Technology Stack

- **Frontend**: React.js
- **Blockchain Integration**: Flow Client Library (FCL)
- **Smart Contract Interaction**: Cadence scripts
- **Styling**: Custom CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Flow blockchain wallet (Blocto, Lilico, etc.)
- NBA Top Shot moments in your collection (for full functionality)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/topshot-verifier.git
   cd topshot-verifier
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Click "Connect Wallet" to authenticate with your Flow wallet
2. Browse your NBA Top Shot moments in the Moment Browser tab
3. Use filters to find specific moments by player, team, or set
4. Click on moment videos to view the full highlight
5. Use the Verification tab to verify ownership of specific moments

## Flow Blockchain Configuration

The application is configured to work with Flow mainnet by default. The configuration includes:

- Access Node: https://rest-mainnet.onflow.org
- Contract Addresses:
  - TopShot: 0x0b2a3299cc857e29
  - MetadataViews: 0x1d7e57aa55817448
  - NonFungibleToken: 0x1d7e57aa55817448

## Cadence Scripts

The application uses the following Cadence scripts to interact with the NBA Top Shot smart contract:

### Get User Moments
```cadence
import TopShot from 0x0b2a3299cc857e29

pub fun main(user: Address): [MomentData] {
  let account = getAccount(user)
  let momentCollection = account.capabilities.borrow<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)
                          ?? panic("User does not have a TopShot Collection")

  // Return all moments with metadata
  // ...
}
```

### Verify Specific Moment Ownership
```cadence
import TopShot from 0x0b2a3299cc857e29

pub fun main(address: Address, momentID: UInt64): Bool {
  let account = getAccount(address)
  
  if let collection = account.capabilities.borrow<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection) {
    return collection.getIDs().contains(momentID)
  }
  
  return false
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NBA Top Shot for the NFT platform
- Flow blockchain for the underlying technology
- The Flow community for support and resources
- [Flow Blockchain](https://flow.com/)
- [NBA Top Shot](https://nbatopshot.com/)
- [Flow Client Library](https://docs.onflow.org/fcl/)
- [Emerald Academy](https://academy.ecdao.org/) for Cadence examples
