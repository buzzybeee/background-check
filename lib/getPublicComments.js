const extractRepoDetails = require('./utils/extractRepoDetailsFromUrl')
const filterUserComments = require('./utils/filterUserComments')
const getIssues = require('./github-api/getIssues')
const getComments = require('./github-api/getComments')

module.exports = async(context, { username }) => {
  const issuesResult = await getIssues(context, { username })
  const { data: { total_count, items: issues } } = issuesResult
  const commentsResults = await getCommentsOnIssues(context, { issues })
  const userComments = getUserComments(commentsResults, username)
  return userComments
}

async function getCommentsOnIssues(context, { issues }) {
  const commentsPromises = issues
    .map(({ number, repository_url: url }) => getComments(context, { issueNum: number, ...extractRepoDetails(url) }))
  return Promise.all(commentsPromises)
}

function getUserComments(commentsResults, username) {
  const userComments = []
  commentsResults.forEach(({ data: commentsData }) => {
    userCommentsOnIssue = filterUserComments(commentsData, username)
    // userCommentsOnIssue is an array holding the wanted user's comment on current issue
    userComments.push(...userCommentsOnIssue) // flatten and store the array
  })
  // userComments hold all his comments on all issues
  return userComments
}