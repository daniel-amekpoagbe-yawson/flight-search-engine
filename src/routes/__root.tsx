// import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// const RootLayout = () => (
//   <>
//     <div className="p-2 flex gap-2">
//       <Link to="/" className="[&.active]:font-bold">
//         Home
//       </Link>{' '}
   
//     </div>
//     <hr />
//     <Outlet />
//     <TanStackRouterDevtools  />
//     <ReactQueryDevtools initialIsOpen={false} />
//   </>
// )

// export const Route = createRootRoute({ component: RootLayout })


import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">✈️ Flight Search</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  ),
});