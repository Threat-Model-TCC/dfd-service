
using Microsoft.EntityFrameworkCore;
using ThreatModelDfdService.Model.Context;
using ThreatModelDfdService.Model.Entity;

namespace ThreatModelDfdService.Repositories.Impl;

public class GenericRepository<T> : IRepository<T> where T : BaseEntity
{

    private readonly MSSQLContext context;

    private readonly DbSet<T> dataset;

    public GenericRepository(MSSQLContext context)
    {
        this.context = context;
        dataset = context.Set<T>();
    }

    public T Create(T t)
    {
        context.Add(t);
        context.SaveChanges();
        return t;
    }

    public async Task<T> CreateAsync(T t)
    {
        await dataset.AddAsync(t);
        return t;
    }

    public async Task<T> UpdateAsync(T t)
    {
        dataset.Update(t); 
        return await Task.FromResult(t);
    }

    public List<T> FindAll()
    {
        return dataset.ToList() ;
    }

    public T FindById(long id)
    {
        return dataset.Find(id);
    }

    public void Update(T t)
    {
        dataset.Update(t);
        context.SaveChanges();
    }

    public void Delete(T t)
    {
        var existingItem = dataset.Find(t.Id);
        if (existingItem == null) return;

        dataset.Remove(existingItem);
        context.SaveChanges();
    }

    public bool Exists(long id)
    {
        return dataset.Any(e => e.Id == id);
    }
}
