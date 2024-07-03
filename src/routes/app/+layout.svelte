<script>
    import { authHandlers } from "../../stores/authStore";
    import { page } from '$app/stores';
</script>


<div class="d-block d-sm-flex h-100">
    <header class="d-flex">
        <div style="width: 100%;" class="d-flex d-sm-none flex-row flex-shrink-0 bg-light h-100 navigationPanel s-dpsU4kCy6M1g">
            <ul class="nav nav-pills nav-flush flex-row mb-auto text-center s-dpsU4kCy6M1g" style="width: 100%;/*! justify-items: ; */justify-content: space-evenly;">
                <li class="nav-item s-dpsU4kCy6M1g">
                    <a href="/app/dashboard" class="nav-link {$page.url.pathname == "/app/dashboard" ? "active" : "" } py-3 border-bottom s-dpsU4kCy6M1g" aria-current="page" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Home">
                        <i class="bi bi-house-door-fill text-dark s-dpsU4kCy6M1g"></i>
                    </a>
                </li>
                <li class="nav-item s-dpsU4kCy6M1g">
                    <a href="/app/profile" class="nav-link {$page.url.pathname == "/app/profile" ? "active" : "" } py-3 border-bottom s-dpsU4kCy6M1g" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                        <i class="bi bi-person-fill text-dark s-dpsU4kCy6M1g"></i>
                    </a>
                </li>
                <li class="nav-item s-dpsU4kCy6M1g">
                    <a href="/app/chat" class="nav-link {$page.url.pathname == "/app/chat" ? "active" : "" } py-3 border-bottom s-dpsU4kCy6M1g" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                        <i class="bi bi-chat-left-fill text-dark s-dpsU4kCy6M1g"></i>
                    </a>
                </li>
                <li class="nav-item s-dpsU4kCy6M1g">
                    <a href="#" class="nav-link  py-3 border-bottom s-dpsU4kCy6M1g" title="" on:click={authHandlers.logout}>
                        <i class="bi bi-box-arrow-right text-dark s-dpsU4kCy6M1g"></i>
                    </a>
                </li>
            </ul>
        </div>

        <div class="d-none d-sm-flex flex-column flex-shrink-0 bg-light h-100 navigationPanel" style="width: 4.5rem;">
            <a href="#" class="d-block p-3 link-dark text-decoration-none text-center navbar-toggler" title="" data-bs-toggle="collapse" data-bs-target="#expandableNav" data-bs-placement="right" data-bs-original-title="Icon-only">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
                </svg>
                <span class="visually-hidden">Icon-only</span>
            </a>
            <ul class="nav nav-pills nav-flush flex-column mb-auto text-center">
                <li class="nav-item">
                    <a href="/app/dashboard" class="nav-link {$page.url.pathname == "/app/dashboard" ? "active" : "" } py-3 border-bottom" aria-current="page" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Home">
                        <i class="bi bi-house-door-fill text-dark"></i>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/app/profile" class="nav-link {$page.url.pathname == "/app/profile" ? "active" : "" } py-3 border-bottom" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                        <i class="bi bi-person-fill text-dark"></i>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/app/chat" class="nav-link {$page.url.pathname == "/app/chat" ? "active" : "" } py-3 border-bottom" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                        <i class="bi bi-chat-left-fill text-dark"></i>
                    </a>
                </li>          
            </ul>
            <a href="#" class="nav-link nav-pills mb-5 text-center" on:click={authHandlers.logout}><i class="bi bi-box-arrow-right"></i> Излизане</a>
        </div>  
        
        <div class="flex-column flex-shrink-0 bg-light h-100 w-100 expandableNav collapse" id="expandableNav">
            <a href="#" class="d-block p-3 link-dark text-decoration-none text-center" data-bs-toggle="collapse" data-bs-target="#expandableNav">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>                
            </a>
            <ul class="nav nav-pills nav-flush flex-column mb-auto text-center">
                <li class="nav-item">
                    <a href="/app/dashboard" class="nav-link py-3 border-bottom expandableNavLink {$page.url.pathname == "/app/dashboard" ? "text-dark" : "text-secondary" }" aria-current="page" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Home">
                        Начало
                    </a>
                </li>
                <li>
                    <a href="/app/profile" class="nav-link py-3 border-bottom expandableNavLink {$page.url.pathname == "/app/profile" ? "text-dark" : "text-secondary" }" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                        Профил
                    </a>
                </li>
                <li>
                    <a href="/app/chat" class="nav-link py-3 border-bottom expandableNavLink {$page.url.pathname == "/app/chat" ? "text-dark" : "text-secondary" }" title="" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Dashboard">
                        Чат
                    </a>
                </li>  
            </ul>
        </div>          
    </header>
    <slot/>
</div>

<style>
    .expandableNav {
        z-index: 999;
    }
    .expandableNavLink {
        border-color: white !important;
    }
    .navigationPanel {
        opacity: 1;
        background: #f0f0f0 !important;
    }
    .nav-item > .active {
        background-color: #fff;
    }
</style>