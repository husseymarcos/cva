export default function Home() {
  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-full max-w-xl bg-base-100 shadow-xl">
        <div className="card-body gap-6">
          <h1 className="card-title text-3xl">
            CVA + daisyUI test
          </h1>
          <p>
            If you see this card with a colored primary button and styled inputs,
            your daisyUI theme <span className="badge badge-primary">corporate</span> is working.
          </p>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Job description</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Paste a job description here..."
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-semibold">Base CV</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Paste your base CV here..."
            />
          </div>

          <div className="card-actions justify-end">
            <button className="btn btn-outline">Clear</button>
            <button className="btn btn-primary">Generate tailored CV</button>
          </div>
        </div>
      </div>
    </main>
  );
}
