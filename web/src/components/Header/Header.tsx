import { FC } from 'react'
import { FiAlignRight as Menu } from 'react-icons/fi'

import './styles.css'

type HeaderProps = {
  onToggleMenu: () => void
}

export const Header: FC<HeaderProps> = ({ onToggleMenu }) => (
  <div className="header-bar">
    <h1>
      google <span>real time</span>
    </h1>

    <div className="menu-toggler" onClick={onToggleMenu}>
      <Menu />
    </div>
  </div>
)

Header.displayName = 'Header'
