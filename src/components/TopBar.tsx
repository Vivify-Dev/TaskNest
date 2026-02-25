import checklistIcon from '../../assets/checklist.png'

interface TopBarProps {
  onAdd: () => void
}

const TopBar = ({ onAdd }: TopBarProps) => (
  <header className="top-bar">
    <div className="top-bar-brand">
      <img
        className="top-bar-icon"
        src={checklistIcon}
        alt=""
        aria-hidden="true"
      />
      <div className="top-bar-text">
        <p className="app-name">TaskNest</p>
        <p className="app-subtitle">Internal Task Tracker</p>
      </div>
    </div>
    <button className="primary-button" type="button" onClick={onAdd}>
      + Add task
    </button>
  </header>
)

export default TopBar
