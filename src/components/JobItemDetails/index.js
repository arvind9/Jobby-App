import {Component} from 'react'
import {withRouter} from 'react-router-dom'
import {IoLocationSharp} from 'react-icons/io5'
import {FaStar, FaBriefcase} from 'react-icons/fa'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import Header from '../Header'
import './index.css'

const apiResult = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class JobItemDetails extends Component {
  state = {
    jobDetails: null,
    similarJobs: [],
    isLoading: apiResult.initial,
  }

  componentDidMount() {
    this.getJobDetails()
  }

  getJobDetails = async () => {
    this.setState({isLoading: apiResult.inProgress})
    const {match} = this.props
    const {params} = match
    const {id} = params

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs/${id}`

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }

    const response = await fetch(apiUrl, options)

    if (response.ok) {
      const data = await response.json()
      const jobDetails = {
        id: data.job_details.id,
        companyLogoUrl: data.job_details.company_logo_url,
        companyWebsiteUrl: data.job_details.company_website_url,
        title: data.job_details.title,
        rating: data.job_details.rating,
        location: data.job_details.location,
        employmentType: data.job_details.employment_type,
        packagePerAnnum: data.job_details.package_per_annum,
        jobDescription: data.job_details.job_description,
        skills: data.job_details.skills.map(skill => ({
          name: skill.name,
          imageUrl: skill.image_url,
        })),
        lifeAtCompany: {
          description: data.job_details.life_at_company.description,
          imageUrl: data.job_details.life_at_company.image_url,
        },
      }

      const similarJobs = data.similar_jobs.map(job => ({
        id: job.id,
        companyLogoUrl: job.company_logo_url,
        title: job.title,
        rating: job.rating,
        location: job.location,
        employmentType: job.employment_type,
        jobDescription: job.job_description,
      }))

      this.setState({
        jobDetails,
        similarJobs,
        isLoading: apiResult.success,
      })
    } else {
      this.setState({isLoading: apiResult.failure})
      this.renderFailureView()
    }
  }

  renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div>
      <Header />
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
          We cannot seem to find the page you are looking for
        </p>
        <button type="button" onClick={this.getJobDetails} className="button">
          Retry
        </button>
      </div>
    </div>
  )

  renderJobDetails = () => {
    const {jobDetails, similarJobs} = this.state
    if (jobDetails) {
      const {
        companyLogoUrl,
        title,
        rating,
        location,
        employmentType,
        packagePerAnnum,
        jobDescription,
        skills,
        lifeAtCompany,
        companyWebsiteUrl,
      } = jobDetails

      return (
        <div className="bg-jid">
          <Header />
          <div className="job-details-container">
            <div className="job-card">
              <div className="job-header">
                <img
                  src={companyLogoUrl}
                  alt="job details company logo"
                  className="company-logo"
                />
                <div>
                  <h1 className="job-title">{title}</h1>
                  <p className="job-rating">
                    <FaStar /> {rating}
                  </p>
                </div>
              </div>
              <div className="job-meta">
                <p>
                  <IoLocationSharp /> {location}
                </p>
                <p>
                  <FaBriefcase /> {employmentType}
                </p>
                <p className="job-package">{packagePerAnnum}</p>
              </div>
              <hr />
              <div className="des-link">
                <h1>Description</h1>
                <a href={companyWebsiteUrl} target="_blank" rel="noreferrer">
                  Visit
                </a>
              </div>
              <p>{jobDescription}</p>
              <h1>Skills</h1>
              <ul className="skills-list">
                {skills.map(skill => (
                  <li key={skill.name} className="skill-item">
                    <img
                      src={skill.imageUrl}
                      alt={skill.name}
                      className="skill-logo"
                    />
                    <p>{skill.name}</p>
                  </li>
                ))}
              </ul>
              <h1>Life at Company</h1>
              <div className="life-at-company">
                <p>{lifeAtCompany.description}</p>
                <img
                  src={lifeAtCompany.imageUrl}
                  alt="life at company"
                  className="life-image"
                />
              </div>
            </div>

            <h1>Similar Jobs</h1>
            <ul className="similar-jobs-list">
              {similarJobs.map(job => (
                <li key={job.id} className="similar-job-card">
                  <img
                    src={job.companyLogoUrl}
                    alt="similar job company logo"
                    className="company-logo"
                  />
                  <h1>{job.title}</h1>
                  <p>
                    <FaStar /> {job.rating}
                  </p>
                  <p>{job.location}</p>
                  <p>{job.employmentType}</p>
                  <h1>Description</h1>
                  <p>{job.jobDescription}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    }
    return null
  }

  renderJobItem = () => {
    const {isLoading} = this.state
    switch (isLoading) {
      case apiResult.inProgress:
        return this.renderLoadingView()
      case apiResult.failure:
        return this.renderFailureView()
      case apiResult.success:
        return this.renderJobDetails()
      default:
        return null
    }
  }

  render() {
    return this.renderJobItem()
  }
}

export default withRouter(JobItemDetails)
