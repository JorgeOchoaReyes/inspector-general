export interface GitHubRepoSync {
    githubId: string,
    name: string,
    full_name: string,
    private: boolean,
    description: string,
    fork: boolean,
    url: string 
    git_url: string,
    ssh_url: string,
    clone_url: string,
    svn_url: string,
    homepage: string,
    size: number,
    stargazers_count: number,
    watchers_count: number, 
}

