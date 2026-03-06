import checklistIcon from '../../assets/checklist.png'

const TopBar = () => (
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
  </header>
)

export default TopBar
