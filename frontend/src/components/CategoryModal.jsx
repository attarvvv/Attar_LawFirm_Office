// Komponen modal untuk mengelola kategori artikel (khusus peran Administrator)
// Menyediakan daftar kategori dengan jumlah artikel terkait, form tambah, edit, dan hapus kategori
import React, { useState, useEffect } from 'react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../api/categories';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaCheck, FaFolder } from 'react-icons/fa';

export default function CategoryModal({ isOpen, onClose, onCategoriesUpdated }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State tambah / edit kategori
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Muat data kategori
  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat kategori.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setCategoryName('');
      setEditingCategory(null);
    }
  }, [isOpen]);

  // Simpan kategori (Tambah atau Edit)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: categoryName.trim() });
      } else {
        await createCategory({ name: categoryName.trim() });
      }

      setCategoryName('');
      setEditingCategory(null);
      await loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan kategori.');
    } finally {
      setSubmitting(false);
    }
  };

  // Pilih kategori untuk diedit
  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setError(null);
  };

  // Batal edit
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setError(null);
  };

  // Hapus kategori dengan penanganan error ramah jika masih memiliki artikel terkait
  const handleDelete = async (cat) => {
    if (!window.confirm(`Yakin ingin menghapus kategori '${cat.name}'?`)) return;

    try {
      await deleteCategory(cat.id);
      await loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err) {
      alert(err.message || 'Gagal menghapus kategori.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent/20 text-primary">
              <FaFolder className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary">
                Kelola Kategori Artikel
              </h3>
              <p className="text-xs text-dark-muted">
                Atur topik dan klasifikasi artikel edukasi hukum.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Form Tambah / Edit Kategori */}
        <form onSubmit={handleSave} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            required
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder={editingCategory ? 'Ubah nama kategori...' : 'Nama kategori baru (contoh: Hukum Bisnis)...'}
            className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            {editingCategory ? (
              <>
                <FaCheck className="w-3 h-3 text-accent" />
                <span>Simpan</span>
              </>
            ) : (
              <>
                <FaPlus className="w-3 h-3 text-accent" />
                <span>Tambah</span>
              </>
            )}
          </button>

          {editingCategory && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
          )}
        </form>

        {/* Daftar Kategori */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1 text-xs max-h-72">
          {loading && (
            <div className="py-8 text-center text-dark-muted">
              Memuat data kategori...
            </div>
          )}

          {!loading && categories.length === 0 && (
            <div className="py-8 text-center text-dark-muted">
              Belum ada kategori yang dibuat.
            </div>
          )}

          {!loading &&
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-cream/30 hover:bg-cream/60 border border-gray-200/80 rounded-xl transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-primary">{cat.name}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                    <span className="font-mono">slug: {cat.slug}</span>
                    <span>&bull;</span>
                    <span>{cat.articles_count || 0} artikel</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 text-gray-600 hover:text-primary rounded-md hover:bg-white transition-colors cursor-pointer"
                    title="Ubah nama kategori"
                  >
                    <FaEdit className="w-3.5 h-3.5 text-accent" />
                  </button>

                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-white transition-colors cursor-pointer"
                    title="Hapus kategori"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Footer Modal */}
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

