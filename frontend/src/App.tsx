import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { BountyList } from './pages/BountyList';
import { CreateBounty } from './pages/CreateBounty';
import { BountyDetail } from './pages/BountyDetail';
import { ReviewDetail } from './pages/ReviewDetail';
import { ContributorPortfolio } from './pages/ContributorPortfolio';
import { Account } from './pages/Account';
import { Protocol } from './pages/Protocol';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/bounties" element={<BountyList />} />
          <Route path="/bounties/new" element={<CreateBounty />} />
          <Route path="/bounties/:bountyId" element={<BountyDetail />} />
          <Route path="/reviews/:reviewId" element={<ReviewDetail />} />
          <Route path="/contributor/:address" element={<ContributorPortfolio />} />
          <Route path="/account" element={<Account />} />
          <Route path="/protocol" element={<Protocol />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
