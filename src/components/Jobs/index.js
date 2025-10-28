import {Component} from 'react'
import {Link} from 'react-router-dom'
import {BsSearch} from 'react-icons/bs'
import {IoLocationSharp} from 'react-icons/io5'
import {FaStar, FaBriefcase} from 'react-icons/fa'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import Header from '../Header'

import './index.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const apiResult = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

const apiResultProfile = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    jobsList: [],
    apiStatus: apiResult.initial,
    employmentType: [],
    salaryRange: '',
    searchInput: '',
    profile: {},
    profileApiStatus: apiResultProfile.initial,
  }

  componentDidMount() {
    this.getjobs()
    this.getProfile()
  }

  getjobs = async () => {
    this.setState({
      apiStatus: apiResult.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const {employmentType, salaryRange, searchInput} = this.state
    const employmentTypeQuery = employmentType.join(',')
    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employmentTypeQuery}&minimum_package=${salaryRange}&search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const fetchedData = await response.json()
      const updatedData = fetchedData.jobs.map(job => ({
        companyLogoUrl: job.company_logo_url,
        employmentType: job.employment_type,
        title: job.title,
        jobDescription: job.job_description,
        packagePerAnnum: job.package_per_annum,
        id: job.id,
        location: job.location,
        rating: job.rating,
      }))
      console.log(updatedData)
      this.setState({
        jobsList: updatedData,
        apiStatus: apiResult.success,
      })
    } else {
      this.setState({
        apiStatus: apiResult.failure,
      })
    }
  }

  getProfile = async () => {
    this.setState({profileApiStatus: apiResultProfile.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok) {
      const data = await response.json()
      const updatedProfile = {
        name: data.profile_details.name,
        profileImageUrl: data.profile_details.profile_image_url,
        shortBio: data.profile_details.short_bio,
      }
      this.setState({
        profile: updatedProfile,
        profileApiStatus: apiResultProfile.success,
      })
    } else {
      this.setState({profileApiStatus: apiResultProfile.failure})
    }
  }

  clearFilters = () => {
    this.setState(
      {
        searchInput: '',
        employmentType: '',
        salaryRange: '',
      },
      this.getjobs,
    )
  }

  changeEmploymentType = typeId => {
    this.setState(prevState => {
      let updatedEmploymentTypes = [...prevState.employmentType]
      if (updatedEmploymentTypes.includes(typeId)) {
        updatedEmploymentTypes = updatedEmploymentTypes.filter(
          each => each !== typeId,
        )
      } else {
        updatedEmploymentTypes.push(typeId)
      }
      return {employmentType: updatedEmploymentTypes}
    }, this.getjobs)
  }

  onEnterSearchInput = event => {
    if (event.key === 'Enter') {
      this.getjobs()
    }
  }

  onChangeSearchInput = searchInput => {
    this.setState({searchInput})
  }

  renderFailureView = () => (
    <div className="jobs-error-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="jobs-failure-img"
      />
      <h1 className="product-failure-heading-text">
        Oops! Something Went Wrong
      </h1>
      <p className="jobs-failure-description">
        We cannot seem to find the page you are looking for.
      </p>
      <button type="button" onClick={this.getjobs} className="button">
        Retry
      </button>
    </div>
  )

  renderProfile = () => {
    const {profileApiStatus, profile, employmentType, salaryRange} = this.state

    const renderProfileSuccess = () => (
      <div className="bg-profile">
        <img
          src={profile.profileImageUrl}
          alt="profile"
          className="profile-pic"
        />
        <h1 className="profile-name">{profile.name}</h1>
        <p className="profile-bio">{profile.shortBio}</p>
      </div>
    )

    const renderProfileFailure = () => (
      <div className="profile-failure">
        <button type="button" onClick={this.getProfile} className="button">
          Retry
        </button>
      </div>
    )

    const renderProfileLoading = () => (
      <div className="loader-container" data-testid="loader">
        <Loader type="ThreeDots" color="#ffffff" height="30" width="30" />
      </div>
    )

    const renderProfileSection = () => {
      switch (profileApiStatus) {
        case apiResultProfile.success:
          return renderProfileSuccess()
        case apiResultProfile.failure:
          return renderProfileFailure()
        case apiResultProfile.inProgress:
          return renderProfileLoading()
        default:
          return null
      }
    }

    return (
      <div>
        {renderProfileSection()}

        <hr />

        <h1 className="sub-headings">Type of Employment</h1>
        <ul className="filters-list">
          {employmentTypesList.map(eachType => (
            <li key={eachType.employmentTypeId}>
              <div className="filter-group">
                <label
                  className="filter-option"
                  key={eachType.employmentTypeId}
                  htmlFor={eachType.employmentTypeId}
                >
                  <input
                    type="checkbox"
                    id={eachType.employmentTypeId}
                    name="employmenttype"
                    value={eachType.employmentTypeId}
                    checked={employmentType.includes(eachType.employmentTypeId)}
                    onChange={() =>
                      this.changeEmploymentType(eachType.employmentTypeId)
                    }
                  />
                  {eachType.label}
                </label>
              </div>
            </li>
          ))}
        </ul>
        <hr />

        <h1 className="sub-headings">Salary Range</h1>
        <ul className="filters-list">
          {salaryRangesList.map(each => (
            <li key={each.salaryRangeId} className="list-salaryRange">
              <input
                type="radio"
                id={each.salaryRangeId}
                name="salary"
                value={each.salaryRangeId}
                checked={salaryRange === each.salaryRangeId}
                onChange={e =>
                  this.setState({salaryRange: e.target.value}, this.getjobs)
                }
              />
              <label htmlFor={each.salaryRangeId} key={each.salaryRangeId}>
                {each.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderjobsListView = () => {
    const {jobsList, apiStatus} = this.state

    const shouldShowjobsList = jobsList.length > 0

    if (apiStatus === apiResult.failure) {
      return this.renderFailureView()
    }
    if (shouldShowjobsList) {
      return (
        <ul className="jobs-list">
          {jobsList.map(eachJob => (
            <Link
              to={`/jobs/${eachJob.id}`}
              key={eachJob.id}
              className="job-link"
            >
              <li className="job-list">
                <div className="job-header">
                  <img
                    src={eachJob.companyLogoUrl}
                    alt="company logo"
                    className="company-logo"
                  />
                  <div className="job-title-rating">
                    <h1 className="job-title">{eachJob.title}</h1>
                    <p className="job-rating">
                      <FaStar /> {eachJob.rating}
                    </p>
                  </div>
                </div>
                <div className="job-details">
                  <div className="job-meta">
                    <p className="job-location">
                      <IoLocationSharp /> {eachJob.location}
                    </p>
                    <p className="job-type">
                      <FaBriefcase /> {eachJob.employmentType}
                    </p>
                  </div>
                  <p className="job-package">{eachJob.packagePerAnnum}</p>
                </div>
                <hr className="job-divider" />
                <div className="job-description">
                  <h2>Description</h2>
                  <p>{eachJob.jobDescription}</p>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      )
    }
    return (
      <div className="no-jobs-view">
        <img
          src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
          className="no-jobs-img"
          alt="no jobs"
        />
        <h1 className="no-jobs-heading">No jobs Found</h1>
        <p className="no-jobs-description">
          We could not find any jobs. Try other filters.
        </p>
      </div>
    )
  }

  renderLoadingView = () => (
    <div className="jobs-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderAlljobs = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiResult.success:
        return this.renderjobsListView()
      case apiResult.failure:
        return this.renderjobsListView()
      case apiResult.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    const {searchInput} = this.state
    return (
      <>
        <Header />
        <div className="all-jobs-section">
          <div className="bg-jobs-section">
            <div className="profile">{this.renderProfile()}</div>
            <div className="bg-search-jobs">
              <div className="search-employment">
                <div className="search-input-container">
                  <input
                    type="search"
                    className="search-input"
                    value={searchInput}
                    placeholder="Search"
                    onChange={e => this.setState({searchInput: e.target.value})}
                    onKeyDown={this.onEnterSearchInput}
                  />
                  <button
                    type="button"
                    className="search-btn"
                    data-testid="searchButton"
                    onClick={this.getjobs}
                  >
                    <BsSearch className="search-icon" />
                  </button>
                </div>
              </div>
              {this.renderAlljobs()}
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default Jobs
