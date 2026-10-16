import {
  useEffect,
  useState,
} from "react";

import {
  apiService,
} from "@/lib/api";

import type {
  PetpoojaItem,
} from "@/lib/api";

interface ProductSearchProps {
  onSelect: (
    item: PetpoojaItem
  ) => void;
}

export default function ProductSearch({
  onSelect,
}: ProductSearchProps) {

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<PetpoojaItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);


  // ==========================================================
  // SEARCH WITH DEBOUNCE
  // ==========================================================

  useEffect(() => {

    const value =
      query.trim();

    if (!value) {

      setResults([]);
      setSearched(false);

      return;
    }

    const timer =
      setTimeout(() => {

        search(value);

      }, 400);

    return () =>
      clearTimeout(timer);

  }, [query]);


  // ==========================================================
  // SEARCH PETPOOJA
  // ==========================================================

  const search = async (
    value: string
  ) => {

    setLoading(true);

    setSearched(false);

    try {

      console.log(
        "🔍 Searching Petpooja:",
        value
      );

      const response =
        await apiService.getItems({
          page: 1,
          perPage: 20,
          itemName: value,
        });

      console.log(
        "🔍 Petpooja search response:",
        response
      );


      const items =
        Array.isArray(response?.data)
          ? response.data
          : [];


      setResults(items);

      setSearched(true);

    } catch (error) {

      console.error(
        "❌ Product search failed:",
        error
      );

      setResults([]);

      setSearched(true);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // CLEAR SEARCH
  // ==========================================================

  const clearSearch = () => {

    setQuery("");

    setResults([]);

    setSearched(false);

  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="w-full">

      {/* ================================================== */}
      {/* SEARCH INPUT */}
      {/* ================================================== */}

      <div className="relative">

        <span
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        >
          🔍
        </span>


        <input
          type="text"
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search Petpooja product..."
          className="
            w-full
            rounded-xl
            border
            border-slate-300
            bg-white
            py-3
            pl-11
            pr-11
            text-sm
            text-slate-900
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-orange-500
            focus:ring-2
            focus:ring-orange-100
          "
        />


        {/* CLEAR */}

        {query && !loading && (

          <button
            type="button"
            onClick={clearSearch}
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              rounded-full
              p-1
              text-slate-400
              hover:bg-slate-100
              hover:text-slate-600
            "
          >
            ✕
          </button>

        )}


        {/* LOADING */}

        {loading && (

          <div
            className="
              absolute
              right-4
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              animate-spin
              rounded-full
              border-2
              border-slate-200
              border-t-orange-500
            "
          />

        )}

      </div>


      {/* ================================================== */}
      {/* SEARCH RESULTS */}
      {/* ================================================== */}

      {query.trim() && (

        <div className="mt-2">

          {/* LOADING */}

          {loading && (

            <div
              className="
                rounded-xl
                border
                border-slate-200
                bg-white
                p-4
                text-center
              "
            >

              <p className="text-sm text-slate-500">
                Searching Petpooja products...
              </p>

            </div>

          )}


          {/* NO RESULTS */}

          {searched &&
            !loading &&
            results.length === 0 && (

              <div
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  text-center
                "
              >

                <div className="text-2xl">
                  🔎
                </div>

                <p
                  className="
                    mt-2
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  No products found
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Try another product name
                </p>

              </div>

            )}


          {/* RESULTS */}

          {!loading &&
            results.length > 0 && (

              <div
                className="
                  max-h-[420px]
                  overflow-y-auto
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  shadow-lg
                "
              >

                {results.map(
                  (item) => (

                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {

                        onSelect(item);

                        clearSearch();

                      }}
                      className="
                        w-full
                        border-b
                        border-slate-100
                        p-4
                        text-left
                        transition
                        last:border-b-0
                        hover:bg-orange-50
                        active:bg-orange-100
                      "
                    >

                      {/* PRODUCT HEADER */}

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >

                          <p
                            className="
                              font-semibold
                              text-slate-900
                            "
                          >
                            {item.itemName}
                          </p>


                          {item.description && (

                            <p
                              className="
                                mt-1
                                truncate
                                text-xs
                                text-slate-400
                              "
                            >
                              {item.description}
                            </p>

                          )}

                        </div>


                        {/* MRP */}

                        <span
                          className="
                            shrink-0
                            rounded-lg
                            bg-orange-50
                            px-2
                            py-1
                            text-xs
                            font-semibold
                            text-orange-600
                          "
                        >
                          ₹
                          {Number(
                            item.mrp || 0
                          ).toFixed(2)}
                        </span>

                      </div>


                      {/* DETAILS */}

                      <div
                        className="
                          mt-3
                          flex
                          flex-wrap
                          gap-2
                          text-xs
                        "
                      >

                        {/* HSN */}

                        <span
                          className="
                            rounded-md
                            bg-slate-100
                            px-2
                            py-1
                            text-slate-600
                          "
                        >
                          HSN{" "}
                          {item.hsn ||
                            "—"}
                        </span>


                        {/* PURCHASE */}

                        <span
                          className="
                            rounded-md
                            bg-slate-100
                            px-2
                            py-1
                            text-slate-600
                          "
                        >
                          Purchase ₹
                          {Number(
                            item.purchaseRate ||
                              0
                          ).toFixed(2)}
                        </span>


                        {/* SALES */}

                        <span
                          className="
                            rounded-md
                            bg-slate-100
                            px-2
                            py-1
                            text-slate-600
                          "
                        >
                          Sale ₹
                          {Number(
                            item.salesRate ||
                              0
                          ).toFixed(2)}
                        </span>


                        {/* STOCK */}

                        <span
                          className="
                            rounded-md
                            bg-slate-100
                            px-2
                            py-1
                            text-slate-600
                          "
                        >
                          Stock{" "}
                          {item.stock ??
                            0}
                        </span>

                      </div>


                      {/* ITEM CODE */}

                      {item.itemCode && (

                        <p
                          className="
                            mt-2
                            text-xs
                            text-slate-400
                          "
                        >
                          Code:{" "}
                          {item.itemCode}
                        </p>

                      )}

                    </button>

                  )
                )}

              </div>

            )}

        </div>

      )}

    </div>

  );
}